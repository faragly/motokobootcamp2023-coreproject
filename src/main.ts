import { HttpClientModule } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { ROUTES } from './app/app.routes';
import { AuthService } from './app/core/services/auth.service';
import { authStateFactory, AUTH_RX_STATE } from './app/core/stores/auth';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule, BrowserAnimationsModule),
    provideRouter(ROUTES),
    { provide: AUTH_RX_STATE, useFactory: authStateFactory },
    AuthService
  ]
}).catch(err => console.error(err));