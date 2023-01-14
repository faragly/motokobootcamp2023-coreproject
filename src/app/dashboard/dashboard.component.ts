import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { AUTH_RX_STATE } from '../core/stores/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div>Principal ID: {{ principal$ | async }}</div>
    <button mat-raised-button (click)="authService.signOut()">Sign out</button>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  authService = inject(AuthService);
  private authState = inject(AUTH_RX_STATE);
  principal$ = this.authState.select('principal');
}
