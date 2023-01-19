import A "./lib/Account";
import ICRC1Types "./types/icrc1.types";
import { MBT_LEDGER_CANISTER_ID } = "../constants";
import Types "./types/types";

actor DAO {
    type Proposal = Types.Proposal;
    let MBTLedger : ICRC1Types.Self = actor (MBT_LEDGER_CANISTER_ID);
    
    public query func get_all_proposals() : async [Proposal] {
        [];
    };

    public shared ({ caller }) func account_balance() : async Nat {
        let defaultSubaccount : A.Subaccount = A.defaultSubaccount();
        await MBTLedger.icrc1_balance_of({ owner = caller; subaccount = ?defaultSubaccount });
    };
}