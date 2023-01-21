import { Routes } from "@angular/router";
import { dashboardGuard } from "./core/guards/dashboard.guard";

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./proposals/proposals.component').then(m => m.ProposalsComponent),
  },
  {
    path: 'create',
    loadComponent: () => import('./create-proposal/create-proposal.component').then(m => m.CreateProposalComponent),
    canActivate: [dashboardGuard]
  },
  { path: '**', redirectTo: '' }
];