import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RxState, selectSlice } from '@rx-angular/state';
import { catchError, defer, finalize, first, iif, map, switchMap, tap, throwError, timer } from 'rxjs';
import { Proposal, ProposalPayload } from 'src/declarations/dao/dao.did';
import { AUTH_RX_STATE } from '../stores/auth';

interface State {
  items: Proposal[];
  loading: {
    items: boolean;
    submit: boolean;
  }
};

@Injectable()
export class ProposalsService extends RxState<State> {
  private authState = inject(AUTH_RX_STATE);
  private snackBar = inject(MatSnackBar);
  readonly refreshProposalsInterval = 60000;

  constructor() {
    super();
    this.set({
      items: [],
      loading: {
        items: false,
        submit: false
      }
    });
    this.connect(
      this.authState.select('actor').pipe(
        switchMap(actor => timer(0, this.refreshProposalsInterval).pipe(switchMap(() => actor.getAllProposals()))),
        map(items => ({ items }))
      )
    );
  }

  submit(payload: ProposalPayload) {
    this.set('loading', state => ({ ...state.loading, submit: true }));
    this.authState.select(selectSlice(['actor', 'isAuthenticated'])).pipe(
      switchMap(({ actor, isAuthenticated }) => 
        iif(() => isAuthenticated, defer(() => actor.submitProposal(payload)), throwError(() => new Error("User is not signed in.")))
      ),
      catchError(err => {
        this.snackBar.open(err.message, undefined, { duration: 2500 });
        return throwError(() => err);
      }),
      first(),
      finalize(() => this.set('loading', state => ({ ...state.loading, submit: false })))
    ).subscribe({
      complete: () => this.snackBar.open("Proposal sent successfully", undefined, { duration: 2500 })
    });
  }
}
