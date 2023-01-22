import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RxState, selectSlice } from '@rx-angular/state';
import { catchError, combineLatestWith, defer, EMPTY, finalize, first, iif, map, startWith, Subject, switchMap, throwError, timer } from 'rxjs';
import { get, has } from 'lodash';

import { ProposalPayload, VoteArgs } from 'src/declarations/dao/dao.did';
import { Proposal, Vote } from '../models';
import { AUTH_RX_STATE } from '../stores/auth';
import { fromTimestamp } from '../utils/date';
import { convertProposalPayload, toProposalState } from '../utils/proposal';
import { AuthService } from './auth.service';

interface State {
  items: Proposal[];
  loading: {
    items: boolean;
    submit: boolean;
    voting: Record<number, boolean>;
  }
};

@Injectable()
export class ProposalsService extends RxState<State> {
  private authState = inject(AUTH_RX_STATE);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  readonly refreshProposalsInterval = 10000;
  private updateItems: Subject<void> = new Subject();

  constructor() {
    super();
    this.set({
      items: [],
      loading: {
        items: false,
        submit: false,
        voting: {}
      }
    });
    this.connect(
      this.authState.select('actor').pipe(
        combineLatestWith(this.updateItems.asObservable().pipe(startWith(null))),
        switchMap(([actor]) => timer(0, this.refreshProposalsInterval).pipe(switchMap(() => actor.getAllProposals()))),
        catchError(err => {
          if (err.message.includes('Failed to authenticate request')) {
            this.authService.signOut();
          }
          return EMPTY;
        }),
        map(items => ({
          items: items.map(item => ({
            ...item,
            id: Number(item.id),
            voters: item.voters.map(([voter]) => voter.toText()) ?? [],
            owner: item.owner.toText(),
            votesYes: Number(item.votesYes),
            votesNo: Number(item.votesNo),
            createdAt: fromTimestamp(item.createdAt),
            state: toProposalState(item.state),
            payload: convertProposalPayload(item.payload)
          }))
        }))
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
      complete: () => {
        this.snackBar.open("Proposal sent successfully", undefined, { duration: 2500 });
        this.updateItems.next();
      }
    });
  }

  vote({ id, vote }: Vote) {
    this.set('loading', state => ({ ...state.loading, voting: { ...state.loading.voting, [id]: true } }));
    const voteArg = { proposalId: BigInt(id), vote: { [vote]: null } } as VoteArgs;
    this.authState.select(selectSlice(['actor', 'isAuthenticated'])).pipe(
      switchMap(({ actor, isAuthenticated }) =>
        iif(() => isAuthenticated, defer(() => actor.vote(voteArg)).pipe(map(result => {
          if (has(result, 'err')) {
            throw new Error(get(result, 'err'));
          }
          return result;
        })), throwError(() => new Error("User is not signed in.")))
      ),
      catchError(err => {
        this.snackBar.open(err.message, undefined, { duration: 2500 });
        return throwError(() => err);
      }),
      first(),
      finalize(() => this.set('loading', state => ({ ...state.loading, voting: { ...state.loading.voting, [id]: false } })))
    ).subscribe({
      complete: () => {
        this.snackBar.open("Vote sent successfully", undefined, { duration: 2500 });
        this.updateItems.next();
      }
    });
  }
}
