import { inject, Injectable } from '@angular/core';
import { CartService } from '@app/shared/services/cart.service';
import { AppMenuService } from '@app/shared/services/app.menu.service';

@Injectable({
    providedIn: 'root',
})
export class CartViewService {
    private readonly carService = inject(CartService);
    private readonly appMenuService = inject(AppMenuService);
}
