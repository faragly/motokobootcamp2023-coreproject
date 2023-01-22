import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AUTH_RX_STATE } from '../core/stores/auth';
import { canisterId } from 'src/declarations/website';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  providers: []
})
export class SidebarComponent {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);
  authState = inject(AUTH_RX_STATE);
  readonly websiteCanisterId = canisterId;
  readonly websiteCanisterUrl = environment.websiteCanisterUrl;

  constructor() {
    this.matIconRegistry.addSvgIconInNamespace('ic', 'motoko-logo', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/motoko-logo.svg'));
    this.matIconRegistry.addSvgIconInNamespace('ic', 'ic-badge', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/ic-badge.svg'));
  }
}
