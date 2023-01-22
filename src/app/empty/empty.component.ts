import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
        <mat-icon svgIcon="empty" class="empty-icon"></mat-icon>
        <ng-content></ng-content>
    `,
  styles: [
    `
            :host {
                display: grid;
                align-content: center;
                justify-items: center;
                grid-row-gap: 1rem;
                height: 100%;
            }

            mat-icon.empty-icon {
                width: 146px;
                height: 120px;
            }
        `
  ]
})
export class EmptyComponent {
  private matIconRegistry = inject(MatIconRegistry);
  private domSanitizer = inject(DomSanitizer);

  constructor() {
    this.matIconRegistry.addSvgIcon('empty', this.domSanitizer.bypassSecurityTrustResourceUrl(`../../assets/empty.svg`));
  }
}
