import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AUTH_RX_STATE } from '../core/stores/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  providers: []
})
export class SidebarComponent {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);
  authState = inject(AUTH_RX_STATE);

  constructor() {
    this.matIconRegistry.addSvgIconInNamespace('ic', 'motoko-logo', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/motoko-logo.svg'));
  }
}
