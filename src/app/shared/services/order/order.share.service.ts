import { computed, Injectable, signal } from '@angular/core';
import { OrderRequestVO } from '@app/shared/types/order.shared.types';

@Injectable({ providedIn: 'root' })
export class OrderShareService {
    private _orderInfo = signal<OrderRequestVO | null>(null);

    readonly getOrderInfoValue = computed(() => this._orderInfo());

    /**
     * @desc 订单提交成功后，更新订单信息
     */
    updateOrderSuccessInfo(orderInfo: OrderRequestVO) {
        this._orderInfo.set(orderInfo);
    }

    /**
     * @desc 清除订单信息
     */
    clearOrderInfo() {
        this._orderInfo.set(null);
    }
}
