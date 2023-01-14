import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { pick } from "lodash";
import { map } from "rxjs";
import { AUTH_RX_STATE } from "../stores/auth";

export const loginGuard = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authState = inject(AUTH_RX_STATE);
    const router = inject(Router);

    return authState.select('isAuthenticated').pipe(map(isAuthenticated => {
        if (isAuthenticated) {
            // Redirect to the dashboard page
            const queryParams = pick(next.queryParams, ['internetIdentityUrl', 'canisterId']);
            return router.createUrlTree(['/'], { queryParams });
        }

        return true;
    }));
  };