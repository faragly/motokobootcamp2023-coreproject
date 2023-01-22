import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, formatNumber, formatPercent } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Proposal, Vote } from '../core/models';

@Component({
  selector: 'app-proposal',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatDividerModule, MatProgressBarModule],
  templateUrl: './proposal.component.html',
  styleUrls: ['./proposal.component.scss']
})
export class ProposalComponent {
  @Input() data: Proposal | null = null;
  @Input() loading: boolean = false;
  @Input() voting: boolean = false;
  @Output() vote: EventEmitter<Vote> = new EventEmitter();

  get percent(): string {
    if (this.data && (this.data.votesYes + this.data.votesNo > 0)) {
      return formatNumber((this.data.votesYes / (this.data.votesYes + this.data.votesNo)) * 100, 'en-US', '0.0')
    }

    return '0';
  }

  get yesPercent(): string {
    if (this.data && (this.data.votesYes > 0)) {
      return formatPercent(this.data.votesYes / (this.data.votesYes + this.data.votesNo), 'en-US', '0.0-2')
    }

    return '0%';
  }

  get noPercent(): string {
    if (this.data && (this.data.votesNo > 0)) {
      return formatPercent(this.data.votesNo / (this.data.votesYes + this.data.votesNo), 'en-US', '0.0-2')
    }

    return '0%';
  }
}
