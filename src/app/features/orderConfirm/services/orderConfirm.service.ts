import { computed, Injectable } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { OrderRequestVO, OrderResultVO } from '@app/shared/types/order.shared.types';
import { CartService } from '@app/shared/services/cart.service';
import { AppUrlService } from '@app/shared/services/app.url.service';

@Injectable({ providedIn: 'root' })
export class OrderConfirmService extends AbstractAppService {
    constructor(
        private cartService: CartService,
        private readonly appUrlService: AppUrlService,
    ) {
        super();
    }

    cartList = computed(() => this.cartService.cartList());

    orderConfirmRequest() {
        const updateData: OrderRequestVO = {
            orderId: '',
        };
        return this.request<OrderResultVO>(this.appUrlService.getApiUrl('API_ORDER_CONFIRM'));
    }
}
