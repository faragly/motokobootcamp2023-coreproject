import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { AUTH_RX_STATE } from './core/stores/auth';

@Component({
  selector: 'app-root',
  template: `
    <mat-icon class="motoko-logo" svgIcon="ic:motoko-logo"></mat-icon>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, MatIconModule]
})
export class AppComponent {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);
  private authState = inject(AUTH_RX_STATE);

  constructor() {
    this.matIconRegistry.addSvgIconInNamespace('ic', 'motoko-logo', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/motoko-logo.svg'));
  }
}
