import { inject, Injectable } from '@angular/core';
import { IdbStorage } from '@dfinity/auth-client';
import { DelegationChain } from '@dfinity/identity';
import { defer, EMPTY, filter, firstValueFrom, from, iif, of, repeat, switchMap, takeUntil, throwError, timer } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isNull } from 'lodash';

import { AUTH_RX_STATE, AuthStatus } from '../stores/auth';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthService {
    private authState = inject(AUTH_RX_STATE);

    anonymous$ = this.authState.select('status').pipe(filter(status => status === AuthStatus.Anonymous));
    initialized$ = this.authState.select('status').pipe(filter(status => status === AuthStatus.Initialized));

    constructor() {
        defer(() => {
            const idbStorage: IdbStorage = new IdbStorage();
            return idbStorage.get('delegation');
        })
            .pipe(
                switchMap(delegationChain =>
                    iif(
                        () => isNull(delegationChain),
                        EMPTY,
                        defer(() => of(DelegationChain.fromJSON(delegationChain as string)))
                    )
                ),
                map(delegation => Number(delegation.delegations[0].delegation.expiration / 1_000_000n - BigInt(Date.now()))),
                switchMap(ms => timer(ms)),
                takeUntil(this.anonymous$),
                repeat({ delay: () => this.initialized$ })
            )
            .subscribe(() => this.signOut());
    }

    signIn() {
        return firstValueFrom(
            this.authState.select('client').pipe(
                switchMap(client =>
                    from(
                        client.login({
                            maxTimeToLive: BigInt(30 * 60 * 1_000_000_000), // 30 minutes
                            identityProvider: environment.identityUrl,
                            onSuccess: () => this.authState.set({ status: AuthStatus.Initialized }),
                            onError: e => throwError(() => new Error(e))
                        })
                    )
                ),
                catchError(throwError)
            )
        );
    }

    signOut() {
        return firstValueFrom(
            this.authState.select('client').pipe(
                switchMap(client => from(client.logout())),
                tap(() => this.authState.set({ status: AuthStatus.Anonymous }))
            )
        );
    }
}
