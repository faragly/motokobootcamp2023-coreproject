import { Routes } from "@angular/router";
import { dashboardGuard } from "./core/guards/dashboard.guard";
import { loginGuard } from "./core/guards/login.guard";

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [dashboardGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  { path: '**', redirectTo: '' }
];