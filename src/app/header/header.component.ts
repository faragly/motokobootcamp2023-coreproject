import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AUTH_RX_STATE } from '../core/stores/auth';
import { AccountComponent } from '../account/account.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AccountComponent, LoginComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  authState = inject(AUTH_RX_STATE);
}
