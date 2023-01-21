import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AUTH_RX_STATE } from "../stores/auth";

export const dashboardGuard = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authState = inject(AUTH_RX_STATE);
    return authState.select('isAuthenticated');
};