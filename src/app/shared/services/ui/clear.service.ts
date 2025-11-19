import { Injectable } from '@angular/core';
import { CartService } from '@app/shared/services/cart/cart.service';
import { OrderShareService } from '@app/shared/services/order/order.share.service';
import { ModelStateService } from '@app/shared/services/data/model-state.service';

@Injectable({ providedIn: 'root' })
export class ClearService {
    constructor(
        private readonly cartService: CartService,
        private readonly orderShareService: OrderShareService,
        private readonly modelStateService: ModelStateService,
    ) {}

    /**
     * @desc 清空购物车、订单信息、用户选择状态
     */
    clearAll(): void {
        this.cartService.clearCart();
        this.orderShareService.clearOrderInfo();
        this.modelStateService.clearUserSelectState();
    }
}
