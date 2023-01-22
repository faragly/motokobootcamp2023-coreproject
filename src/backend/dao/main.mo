import TrieMap "mo:base/TrieMap";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import List "mo:base/List";
import Error "mo:base/Error";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import IC "mo:base/ExperimentalInternetComputer";

import A "./lib/Account";
import ICRC1Types "./types/icrc1.types";
import Types "./types/types";
import { MBT_LEDGER_CANISTER_ID } = "../constants";

actor DAO {
    type Proposal = Types.Proposal;
    type ProposalPayload = Types.ProposalPayload;
    type Params = Types.Params;
    type VoteArgs = Types.VoteArgs;
    type Action = Types.Action;
    type ModifyParamsPayload = Types.ModifyParamsPayload;

    let MBTLedger : ICRC1Types.Self = actor (MBT_LEDGER_CANISTER_ID);
    stable var params : Params = {
        proposalVoteThreshold = 100_000_000;
        proposalCreateThreshold = 100_000_000;
        proposalAcceptThreshold = 10_000_000_000;
    };
    stable var proposalId : Nat = 0;
    var proposals : TrieMap.TrieMap<Nat, Proposal> = TrieMap.TrieMap(Nat.equal, Hash.hash);

    public shared ({ caller }) func submitProposal(payload : ProposalPayload) : async () {
        assert not Principal.isAnonymous(caller);
        let threshold = params.proposalCreateThreshold;
        switch (await hasRights(caller, #create)) {
            case null {
                // TODO: convert e8s to human readable with float
                throw Error.reject("Caller must have at least " # debug_show(threshold) # " to submit a proposal");
            };
            case _ {
                let proposal : Proposal = {
                    id = proposalId;
                    owner = caller;
                    voters = List.nil<Principal>();
                    createdAt = Time.now();
                    state = #open;
                    votesYes = 0;
                    votesNo = 0;
                    payload;
                };
                proposals.put(proposalId, proposal);
                proposalId += 1;
            };
        };
    };

    public query func getProposal(id : Nat) : async ?Proposal {
        proposals.get(id);
    };

    public shared ({ caller }) func vote({ proposalId; vote } : VoteArgs) : async Result.Result<(), Text> {
        assert not Principal.isAnonymous(caller);

        switch (proposals.get(proposalId)) {
            case null #err("No proposal with ID " # Nat.toText(proposalId) # " exists");
            case (?proposal) {
                if (proposal.state != #open) {
                    return #err("Proposal " # Nat.toText(proposalId) # " is not open for voting");
                };

                if (List.some<Principal>(proposal.voters, func voter = Principal.equal(caller, voter))) {
                    return #err("Already voted");
                };
                
                switch (await hasRights(caller, #vote)) {
                    case null #err("Caller must have at least " # debug_show(params.proposalVoteThreshold) # " to vote on a proposal");
                    case (?votingToken) {
                        var votesYes = proposal.votesYes;
                        var votesNo = proposal.votesNo;
                        
                        switch (vote) {
                            case (#yes) { votesYes += votingToken };
                            case (#no) { votesNo += votingToken };
                        };

                        let voters = List.push(caller, proposal.voters);
                        var state = proposal.state;

                        if (Nat.greaterOrEqual(votesYes, params.proposalAcceptThreshold)) {
                            state := #accepted;
                        };
                        
                        if (Nat.greaterOrEqual(votesNo, params.proposalAcceptThreshold)) {
                            state := #rejected;
                        };
                        
                        let updatedProposal : Proposal = { proposal with votesYes; votesNo; voters; state };
                        proposals.put(proposalId, updatedProposal);
                        if (state == #accepted) ignore executeProposal(proposalId);
                        #ok();
                    };
                };
            };
        };  
    };

    public query func getAllProposals() : async [Proposal] {
        Iter.toArray<Proposal>(proposals.vals());
    };

    public shared ({ caller }) func modifyParameters(payload : ModifyParamsPayload) : async () {
        let self = Principal.fromActor(DAO);
        assert Principal.equal(caller, self);

        params := {
            proposalVoteThreshold = Option.get(payload.proposalVoteThreshold, params.proposalVoteThreshold);
            proposalCreateThreshold = Option.get(payload.proposalCreateThreshold, params.proposalCreateThreshold);
            proposalAcceptThreshold = Option.get(payload.proposalAcceptThreshold, params.proposalAcceptThreshold);
        } : Params;
    };

    public query func getParameters() : async Params {
        params;
    };
    
    // checking if the caller has enough funds to the action
    func hasRights(caller : Principal, action : Action) : async ?Nat {
        let defaultSubaccount : A.Subaccount = A.defaultSubaccount();
        let balance = await MBTLedger.icrc1_balance_of({ owner = caller; subaccount = ?defaultSubaccount });
        let threshold = switch (action) {
            case (#create) params.proposalCreateThreshold;
            case (#vote) params.proposalVoteThreshold;
        };
        switch (Nat.less(balance, threshold)) {
            case true null;
            case false ?balance;
        };
    };

    func executeProposal(id : Nat) : async () {
        switch(proposals.get(id)) {
            case null Prelude.unreachable();
            case (?proposal) {
                if (proposal.state == #accepted) {
                    proposals.put(id, { proposal with state = #executing });
                    try {
                        let { canisterId; method; data } = proposal.payload;
                        ignore await IC.call(canisterId, method, data);
                        proposals.put(id, { proposal with state = #succeeded });
                    } catch err {
                        proposals.put(id, { proposal with state = #failed(Error.message(err)) });
                    }
                }
            };
        }
    };

    private stable var stableProposals : [(Nat, Proposal)] = [];

    system func preupgrade() {
        stableProposals := Iter.toArray(proposals.entries());
    };

    system func postupgrade() {
        proposals := TrieMap.fromEntries<Nat, Proposal>(stableProposals.vals(), Nat.equal, Hash.hash);
    };

}