import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs';

import { AuthService } from '../core/services/auth.service';
import { AccountService } from '../core/services/account.service';
import { formatMBT } from '../core/utils/formatMBT';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ClipboardModule, MatSnackBarModule, MatTooltipModule, MatCardModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [AccountService]
})
export class AccountComponent {
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  accountService = inject(AccountService);
  principal$ = this.accountService.select('principal');
  balance$ = this.accountService.select('balance').pipe(
    map(amount => `${formatMBT(amount.toE8s())} ${amount.token.symbol}`)
  );

  copyPrincipal() {
    const principalId = this.accountService.get('principal');
    if (principalId) {
      this.clipboard.copy(principalId.toText());
      this.snackBar.open('Principal ID copied to clipboard', undefined, { duration: 1000 });
    }
  }

  updateBalance() {
    this.accountService.balance();
  }
}
