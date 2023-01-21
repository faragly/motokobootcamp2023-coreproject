import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <button color="primary" mat-raised-button (click)="authService.signIn()">Sign in with Internet Identity</button>
  `,
  styles: [
    `:host {
      display: flex;
      flex-basis: 100%;
      justify-content: flex-end;
    }`
  ]
})
export class LoginComponent {
  authService = inject(AuthService);
}
