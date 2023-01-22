import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { AsyncSubject, map, Observable, shareReplay, takeUntil } from 'rxjs';
import { selectSlice } from '@rx-angular/state';
import { isUndefined } from 'lodash';

import { AUTH_RX_STATE } from '../core/stores/auth';
import { ProposalsService } from '../core/services/proposals.service';
import { ProposalComponent } from '../proposal/proposal.component';
import { Proposal, ProposalState, Vote } from '../core/models';
import { EmptyComponent } from '../empty/empty.component';

type Chip = { value: ProposalState, label: string, count: number; color?: 'primary' | 'warn' | 'accent' };

@Component({
  selector: 'app-proposals',
  standalone: true,
  imports: [CommonModule, MatChipsModule, ProposalComponent, EmptyComponent],
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss']
})
export class ProposalsComponent {
  authState = inject(AUTH_RX_STATE);
  proposalsService = inject(ProposalsService);
  items$: Observable<Proposal[]> = this.proposalsService.select(selectSlice(['items', 'filters', 'filtered'])).pipe(map(({ items, filters, filtered }) => {
    if (filtered) {
      return items.filter(({ state }) => filters.includes(state));
    }

    return items;
  }), shareReplay(1));
  hasItems$: Observable<boolean> = this.items$.pipe(map(items => items.length > 0));
  loading$: Observable<Record<number, boolean>> = this.proposalsService.select('loading', 'voting');
  readonly proposalState: Chip[] = [
    { value: 'open', label: 'Open', count: 0 },
    { value: 'accepted', label: 'Accepted', count: 0 },
    { value: 'rejected', label: 'Rejected', count: 0, color: 'warn' },
    { value: 'succeeded', label: 'Succeeded', count: 0 },
    { value: 'executing', label: 'Executing', count: 0 },
    { value: 'failed', label: 'Failed', count: 0, color: 'warn' }
  ];
  states$ = this.proposalsService.select('items').pipe(map(items => {
    let count = items.reduce((result, { state }) => {
      if (isUndefined(result[state])) {
        result[state] = 1;
      } else {
        result[state] = result[state] + 1
      }
      return result;
    }, {} as Record<string, number>);
    return this.proposalState.map(item => ({ ...item, count: item.count + (count[item.value] ?? 0) }))
  }));
  filterChanged: AsyncSubject<void> = new AsyncSubject();
  selected$ = this.states$.pipe(map(items => items.filter(({ count }) => count > 0).map(({ value }) => value)), takeUntil(this.filterChanged));

  itemTrackBy(index: number, item: Proposal) {
    return item.id;
  }

  chipTrackBy(index: number, item: Chip) {
    return item.value;
  }

  handleVote(vote: Vote) {
    this.proposalsService.vote(vote);
  }

  get votingEnabled(): boolean {
    return this.authState.get('isAuthenticated');
  }

  handleFilter(event: MatChipListboxChange) {
    this.filterChanged.next();
    this.filterChanged.complete();
    this.proposalsService.set({ filters: event.value, filtered: true });
  }
}
