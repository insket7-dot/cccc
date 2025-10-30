// src/app/core/guards/auth.guard.ts
import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CacheKey } from '@app/shared/constants/cache.key';
import { ModelStateService } from '@app/shared/services/model-state.service';
import { LocalStorage } from '@rydeen/angular-framework';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    private readonly modelStateService = inject(ModelStateService);

    constructor(private router: Router) {}

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const deviceId: string | null = await LocalStorage.getItem(CacheKey.DEVICE_ID);

        if (!deviceId) {
            this.router
                .navigate(['/login'], {
                    queryParams: { state: 'BIND' },
                    replaceUrl: true,
                })
                .catch((error) => console.error(error));
            return false;
        }

        this.modelStateService.setDeviceId(deviceId);

        return true;
    }
}
