import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { AUTH_RX_STATE } from '../core/stores/auth';
import { ProposalsService } from '../core/services/proposals.service';
import { ProposalComponent } from '../proposal/proposal.component';
import { Proposal, Vote } from '../core/models';

@Component({
  selector: 'app-proposals',
  standalone: true,
  imports: [CommonModule, ProposalComponent],
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss']
})
export class ProposalsComponent {
  authState = inject(AUTH_RX_STATE);
  proposalsService = inject(ProposalsService);
  items$: Observable<Proposal[]> = this.proposalsService.select('items');
  loading$: Observable<Record<number, boolean>> = this.proposalsService.select('loading', 'voting');

  itemTrackBy(index: number, item: Proposal) {
    return item.id;
  }

  handleVote(vote: Vote) {
    this.proposalsService.vote(vote);
  }

  get votingEnabled(): boolean {
    return this.authState.get('isAuthenticated');
  }
}
