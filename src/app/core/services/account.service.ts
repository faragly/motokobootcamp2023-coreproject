import { inject, Injectable } from "@angular/core";
import { ActorSubclass } from "@dfinity/agent";
import { Token, TokenAmount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { toNullable } from "@dfinity/utils";
import { RxState, selectSlice } from "@rx-angular/state";
import { combineLatestWith, defer, EMPTY, from, iif, map, merge, of, startWith, Subject, switchMap } from "rxjs";
import { canisterId, idlFactory } from "src/declarations/mbt_ledger";
import { _SERVICE as ICRC1Actor } from "src/declarations/mbt_ledger/mbt_ledger.did";
import { AUTH_RX_STATE } from "../stores/auth";
import { createActor } from "../utils/create-actor";

export interface AccountState {
    actor: ActorSubclass<ICRC1Actor> | null;
    principal: Principal | null;
    balance: TokenAmount;
}

export const MBTToken: Token = {
    symbol: 'MBT',
    name: 'Motoko Bootcamp Token'
};

@Injectable()
export class AccountService extends RxState<AccountState> {
    private authState = inject(AUTH_RX_STATE);
    private updateBalance: Subject<void> = new Subject<void>();

    constructor() {
        super();
        this.set({
            balance: TokenAmount.fromNumber({
                amount: 0, token: MBTToken
            })
        });
        const actor$ = this.authState.select(selectSlice(['isAuthenticated', 'identity'])).pipe(
            switchMap(({ identity, isAuthenticated }) =>
                iif(
                    () => isAuthenticated,
                    defer(() => createActor<ICRC1Actor>({ identity, canisterId, idlFactory }).pipe(
                        map(actor => ({ actor, principal: identity.getPrincipal() }))
                    )),
                    of({ actor: null, principal: null })
                )
            )
        );
        const balance$ = this.select(selectSlice(['actor', 'principal'])).pipe(
            combineLatestWith(this.updateBalance.asObservable().pipe(startWith(null))),
            switchMap(([{ actor, principal }]) => {
                if (actor && principal) {
                    let account = { owner: principal, subaccount: toNullable<Uint8Array>(undefined) };
                    return from(actor.icrc1_balance_of(account));
                }

                return EMPTY;
            }),
            map(balance => ({ balance: TokenAmount.fromE8s({ amount: balance, token: MBTToken }) }))
        );
        this.connect(merge(actor$, balance$));
    }

    async balance() {
        this.updateBalance.next();
    }
}
