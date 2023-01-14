import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/services/auth.service';
import { AuthStatus, AUTH_RX_STATE } from '../core/stores/auth';
import { AsyncSubject, Observable, switchMap, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { get, has, pick } from 'lodash';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <button color="primary" mat-raised-button (click)="authService.signIn()">Sign in with Internet Identity</button>
  `,
  styles: [
  ]
})
export class LoginComponent {
  authService = inject(AuthService);
  private authState = inject(AUTH_RX_STATE);
  status$: Observable<AuthStatus> = this.authState.select('status');
  readonly authStatus = AuthStatus;
  private destroyed: AsyncSubject<void> = new AsyncSubject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.authState
      .select('isAuthenticated')
      .pipe(
        switchMap(() => this.route.queryParams),
        takeUntil(this.destroyed)
      )
      .subscribe(queryParams => {
        const url = has(queryParams, 'redirect') ? get(queryParams, 'redirect') : '/';
        this.router.navigate([url], { queryParams: pick(queryParams, ['internetIdentityUrl', 'canisterId']) });
      });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
