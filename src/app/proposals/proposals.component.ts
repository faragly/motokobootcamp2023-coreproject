import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AsyncSubject, takeUntil } from 'rxjs';
import { AUTH_RX_STATE } from '../core/stores/auth';
import { ProposalsService } from '../core/services/proposals.service';

@Component({
  selector: 'app-proposals',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule],
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss']
})
export class ProposalsComponent implements OnInit, OnDestroy {
  authState = inject(AUTH_RX_STATE);
  proposalsService = inject(ProposalsService);
  private destroyed: AsyncSubject<void> = new AsyncSubject<void>();

  ngOnInit(): void {
    this.proposalsService.select().pipe(takeUntil(this.destroyed)).subscribe(console.log);
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}  
