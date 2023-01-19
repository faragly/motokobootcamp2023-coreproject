import { InjectionToken } from '@angular/core';
import { RxState } from '@rx-angular/state';
import { AuthClient } from '@dfinity/auth-client';
import { ActorSubclass, AnonymousIdentity, Identity } from '@dfinity/agent';
import { filter, from, merge, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { _SERVICE as DAOActor } from 'src/declarations/dao/dao.did';
import { canisterId, idlFactory } from 'src/declarations/dao';
import { createActor } from '../utils/create-actor';

export enum AuthStatus {
    Anonymous,
    Initialized
}

export interface AuthState {
    status: AuthStatus;
    client: AuthClient;
    actor: ActorSubclass<DAOActor>;
    identity: Identity;
    isAuthenticated: boolean;
}

export const AUTH_RX_STATE = new InjectionToken<RxState<AuthState>>('AUTH_RX_STATE');
export const authStateFactory = () => {
    const state = new RxState<AuthState>();
    state.connect(
        from(AuthClient.create()).pipe(
            switchMap(client =>
                from(client.isAuthenticated()).pipe(
                    map(isAuthenticated => ({
                        client,
                        status: isAuthenticated ? AuthStatus.Initialized : AuthStatus.Anonymous,
                        identity: client.getIdentity()
                    }))
                )
            )
        )
    );
    const anonymous$ = state.select('status').pipe(
        filter(status => status === AuthStatus.Anonymous),
        switchMap(() => {
            const identity = new AnonymousIdentity();
            return createActor<DAOActor>({ identity, canisterId, idlFactory }).pipe(map(actor => ({
                identity, actor, isAuthenticated: false, principal: null
            })));
        })
    );
    const authenticated$ = state.select('status').pipe(
        filter(status => status === AuthStatus.Initialized),
        switchMap(() => {
            const identity = state.get('client').getIdentity();
            const principal = identity.getPrincipal().toText();
            return createActor<DAOActor>({ identity, canisterId, idlFactory }).pipe(map(actor => ({
                identity, actor, isAuthenticated: true, principal
            })));
        })
    );
    state.connect(merge(anonymous$, authenticated$));

    return state;
};
