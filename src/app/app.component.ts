import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from "./sidebar/sidebar.component";

@Component({
    selector: 'app-root',
    template: `
    <app-sidebar/>
    <app-header/>
    <div class="content">
      <router-outlet/>
    </div>
  `,
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterModule, SidebarComponent, HeaderComponent]
})
export class AppComponent {
  
}
