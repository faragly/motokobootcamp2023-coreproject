import List "mo:base/List";
import Time "mo:base/Time";

module {
    public type Tokens = Nat;
    public type Action = {
        #create;
        #vote;
    };
    public type ProposalState = {
        // A failure occurred while executing the proposal
        #failed : Text;
        // The proposal is open for voting
        #open;
        // The proposal is currently being executed
        #executing;
        // Enough "no" votes have been cast to reject the proposal, and it will not be executed
        #rejected;
        // The proposal has been successfully executed
        #succeeded;
        // Enough "yes" votes have been cast to accept the proposal, and it will soon be executed
        #accepted;
    };
    public type Proposal = {
        id : Nat;
        owner : Principal;
        voters : List.List<Principal>;
        state : ProposalState;
        createdAt : Time.Time;
        votesYes : Tokens;
        votesNo : Tokens;
        payload : ProposalPayload;
    };
    public type ProposalPayload = {
        method : Text;
        canisterId : Principal;
        data : Blob;
    };
    public type Vote = { #no; #yes };
    public type VoteArgs = { vote : Vote; proposalId : Nat };
    public type Params = {
        // The amount of tokens needed to vote "yes" to accept, or "no" to reject, a proposal
        proposalVoteThreshold : Tokens;
        // The amount of tokens needed to create a proposal
        proposalCreateThreshold : Tokens;
        // The amount of tokens needed to accept a proposal
        proposalAcceptThreshold : Tokens;
    };
    public type ModifyParamsPayload = {
        proposalVoteThreshold : ?Tokens;
        proposalCreateThreshold : ?Tokens;
        proposalAcceptThreshold : ?Tokens;
    };
}