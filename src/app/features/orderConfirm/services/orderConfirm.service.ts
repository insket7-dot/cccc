import { computed, Injectable } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { OrderDetailItem, OrderRequestVO } from '@app/shared/types/order.shared.types';
import { CartService } from '@app/shared/services/cart.service';
import { AppUrlService } from '@app/shared/services/app.url.service';
import { DateUtils } from '@app/shared/services/date-utils.service';
import { v4 as uuidV4 } from 'uuid';
import { SerialNumberService } from '@app/shared/services/serial-number.service';
import { AppStoreService } from '@app/shared/services/app.store.service';
import { ProductType } from '@app/shared/constants/menu.constants';
import { OrderConstants } from '../constants/constants';
import { PriceService } from '@app/shared/services/price.service';
import { MenuFacadeService } from '@app/shared/services/ui/menu-facade.service';

@Injectable({ providedIn: 'root' })
export class OrderConfirmService extends AbstractAppService {
    constructor(
        private appStoreService: AppStoreService,
        private cartService: CartService,
        private readonly appUrlService: AppUrlService,
        private dateService: DateUtils,
        private serialNumberService: SerialNumberService,
        private menuFacadeService: MenuFacadeService,
        private readonly priceService: PriceService,
    ) {
        super();
    }

    cartList = computed(() => this.cartService.cartList());
    menuCartList = computed(() => this.menuFacadeService.cartListValue());
    storeBaseInfo = computed(() => this.appStoreService.storeBaseInfoValue());

    /**
     * @desc 补零操作
     * @param value 要补零的数值
     * @param length 目标长度
     * @returns 补零后的字符串
     */
    padZero(value: string | number, length: number): string {
        const strValue = typeof value === 'string' ? value : value.toString();
        return strValue.padStart(length, '0');
    }

    /**
     * @desc 订单号生成规则
     * 下单日期(YYYYMMDD) +201(代表Kiosk渠道)+Kiosk设备编号(6位)+Kiosk流水号(补足4位) +随机数(补足4位)
     */
    orderId = computed(() => {
        const random = uuidV4().substring(0, 4);
        const serialNumber = this.serialNumberService.currentSerialNumberValue();
        return `${this.dateService.formatDate(new Date()).replace(/-/g, '')}${OrderConstants.ORDER_CHANNEL}${this.padZero(this.modelStateService.deviceIdValue(), 6)}${serialNumber}${random}`;
    });

    /**
     * @desc 订单详情数据重组
     */
    private reformatOrderDetails() {
        return this.menuCartList().map((item) => {
            console.log('reform order item:', item);
            const result: OrderDetailItem = {
                orderItemId: uuidV4(),
                spuId: item.productId,
                spuName: item.productName,
                skuId: item.spec?.skuId ?? '',
                productNameCn: item.productName,
                originalPrice: this.priceService.toFen(item?.price ?? 0),
                realPrice: this.priceService.toFen(item?.subtotal ?? 0),
                quantity: item.quantity ?? 1,
                foodType: isNaN(Number(item.productType)) ? -1 : Number(item.productType), // -1为异常值，需排查数据
            };
            // 单品
            if (item.productType === ProductType.PRODUCT) {
                // 规格
                if (item.spec) {
                    result.specList = [
                        {
                            specsCategoryCode: item.spec?.skuId ?? -1,
                            specsCategoryNameCn: item.spec?.skuNameCn ?? '',
                        },
                    ];
                }

                // 加料
                if (item.grill) {
                    result.grillList = item.grill.flatMap((t) => {
                        return t.itemList.map((x) => ({
                            grillItemId: uuidV4(),
                            grillType: t.grillCode,
                            grillCode: x.productId,
                            grillNameCn: x.productNameCn,
                            quantity: x?.quantity ?? 1,
                            price: this.priceService.toFen(x?.price ?? 0),
                        }));
                    });
                }
            }
            // 套餐
            if (item.productType === ProductType.COMBO && item?.rounds && item.rounds.length > 0) {
                const list = item.rounds.flatMap((t) => {
                    return t.itemList.map((x) => ({
                        round: t.round.toString(),
                        roundNameCn: t.roundNameCn,
                        skuId: x.skuId,
                        productNameCn: x.productName,
                        quantity: x.quantity ?? 1,
                        originalPrice: this.priceService.toFen(item.price ?? 0),
                        realPrice: this.priceService.toFen(x.price ?? 0),
                    }));
                });
                console.log('list:', list);
                result.itemList = list;
            }

            return result;
        });
    }

    /**
     * @desc 提交订单
     */
    async orderConfirmRequest() {
        const updateData: OrderRequestVO = {
            thirdOrderId: this.orderId(),
            brandCode: this.storeBaseInfo()?.brandCode ?? '',
            channelId: OrderConstants.ORDER_CHANNEL,
            orderType: OrderConstants.ORDER_TYPE_TAKE_IN,
            storeCode: this.storeBaseInfo()?.storeCode ?? '',
            storeName: this.storeBaseInfo()?.storeName ?? '',
            createTime: this.dateService.formatDateTime(new Date()),
            orderTime: this.dateService.formatDateTime(new Date()),
            userRealPrice: this.priceService.toFen(this.cartService.cartTotal()?.total ?? 0),
            bookFlag: OrderConstants.ORDER_BOOKING_FLAG_INSTANT,
            payMode: OrderConstants.ORDER_BOOKING_FLAG_PAC,
            orderDetails: this.reformatOrderDetails(),
        };
        const url = this.appUrlService.getApiUrl('API_ORDER_CONFIRM');
        const res = await this.request<void>(url, updateData);
        return res.data
    }
}
