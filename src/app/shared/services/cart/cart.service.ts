import { computed, Injectable, signal } from '@angular/core';
import { ShopCartProduct, ShopCartSummary } from '@app/shared/types/cart.shared.types';
import { debounceTime, Subject } from 'rxjs';
import { CartUpdateResult, TipTypeEnums } from '@app/shared/constants/app.enums';
import { SubtotalService } from '@app/shared/services/cart/subtotal.service';
import { PriceService } from '@app/shared/services/util/price.service';
import { ProductLimit } from '@app/shared/constants/menu.constants';
import { AppStoreService } from '@app/shared/services/data/app.store.service';
import { NumberCountTypeEnum } from '@app/shared/constants/tax.enums';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    constructor(
        private subtotalService: SubtotalService,
        private priceService: PriceService,
        private readonly appStoreService: AppStoreService,
    ) {
        this.cartChanges$
            .pipe(
                debounceTime(200), // 防抖 200ms
            )
            .subscribe(() => {
                this.cartMapSignal.set(new Map(this._cartMap));
            });
    }
    // 附加费列表
    extraChange = computed(() => this.appStoreService.extraChangeValue());
    // 门店信息
    storeInfo = computed(() => this.appStoreService.storeBaseInfoValue());

    // 最大购物车商品数量
    private maxCartCount = ProductLimit.LIMIT_MAX;
    // 购物车商品项Map
    private _cartMap: Map<string, ShopCartProduct> = new Map();
    // 购物车商品项信号量
    private cartMapSignal = signal<Map<string, ShopCartProduct>>(new Map());
    // 购物车商品项变更流
    private cartChanges$ = new Subject<void>();
    // 小费
    private _tip = signal<number>(0);

    // 小费信号量
    readonly tip = computed(() => this._tip());
    // 购物车列表
    readonly cartList = computed(() => Array.from(this.cartMapSignal().values()));
    // 唯一ID -> 商品勾选参数
    readonly cartMap = computed(() => this.cartMapSignal());
    // 购物车总价
    readonly cartTotal = computed(() => {
        // 购物车商品项总价计算（包含外税）
        const total = this.priceService.toNumber(
            this.priceService.sumList(this.cartList().map((item) => item.subtotal ?? 0)),
        );

        // 商品原价的总和（不含外税）
        const originalTotal = this.priceService.toNumber(
            this.priceService.sumList(this.cartList().map((item) => item.displaySubtotal ?? 0)),
        );

        // 购物车商品项总数量计算
        const totalCount = this.cartList().reduce((acc, item) => acc + item.quantity, 0);

        // 消费税税率
        const taxRate = this.storeInfo()?.taxRate;

        // 订单附加费税费
        let extraChargeFee = this.priceService.zero();

        // 附加费消费税税费
        let orderFee = this.priceService.zero();

        // 附加费计算
        if (this.extraChange().length > 0) {
            extraChargeFee = this.priceService.sumList(
                this.extraChange().map((item) => {
                    // 附加费默认人数为1人
                    let peopleCount: number = 1;
                    // 就餐人数
                    // if (item.changeNumber === YesNoNumberEnums.YES) {
                    //     peopleCount = item.minNum ?? 1;
                    // }

                    // 百分比
                    if (item.extraChargeType === NumberCountTypeEnum.PERCENTAGE) {
                        return this.priceService.mul(
                            this.priceService.mul(
                                originalTotal,
                                this.priceService.toPercentage(item.number ?? 0),
                            ),
                            peopleCount,
                        );
                    }

                    // 固定金额
                    if (item.extraChargeType === NumberCountTypeEnum.AMOUNT) {
                        return this.priceService.mul(item.number ?? 0, peopleCount);
                    }

                    // 默认返回0
                    return this.priceService.zero();
                }),
            );
            console.log('extraChargeFee', this.priceService.toNumber(extraChargeFee));
        }

        // 附加费消费税计算
        if (taxRate) {
            orderFee = this.priceService.mul(
                extraChargeFee,
                this.priceService.toPercentage(taxRate),
            );
            console.log('orderFee', this.priceService.toNumber(orderFee));
        }

        // 订单附加费
        const data: ShopCartSummary = {
            total: this.priceService.toNumber(
                this.priceService.add(total, extraChargeFee, orderFee, this._tip()),
            ), // 待支付实际金额
            surchargeAmount: this.priceService.toNumber(extraChargeFee), // 附加费总金额
            surchargeTaxAmount: this.priceService.toNumber(orderFee), // 附加费消费税总金额
            count: totalCount,
            orderTotal: total, // 订单商品项总金额
            taxRate,
            tip: this._tip() ?? 0, // 小费金额
        };
        console.log('cart total', data);
        return data;
    });

    /**
     * @desc 设置小费
     * @param tip 小费金额
     * @param type 小费类型
     */
    setTip(tip: number, type: TipTypeEnums) {
        let total = this.priceService.zero();
        if (type === TipTypeEnums.PERCENT) {
            // 税总价计算？ 包含附加费吗？
            total = this.priceService.mul(this.cartTotal()?.orderTotal ?? 0, tip / 100);
        }
        if (type === TipTypeEnums.FIXED) {
            total = this.priceService.add(tip);
        }
        this._tip.set(this.priceService.toNumber(total));
    }

    /**
     * @desc 触发购物车商品项变更事件
     */
    private emitChange() {
        this.cartChanges$.next();
    }

    /**
     * @desc 计算并更新购物车商品的小计价格
     * @param item 购物车商品项
     * @returns 更新后的购物车商品项（新对象）
     */
    private updateSubtotal(item: ShopCartProduct) {
        console.log('updateSubtotal', item);
        // 计算小计相关数据
        const computedData = this.subtotalService.subtotalComputed(item);

        // 创建包含计算结果的新对象
        const updatedItem = { ...item, subtotal: computedData.subtotal, taxData: computedData };

        // 更新购物车中的商品数据
        this._cartMap.set(item.cartId, updatedItem);

        // 返回更新后的新对象，保持API一致性
        return updatedItem;
    }

    /**
     * @desc 添加商品到购物车内
     */
    async addToCart(product: ShopCartProduct) {
        const hasKey = this._cartMap.has(product.cartId);
        if (hasKey) {
            const cartItem = this._cartMap.get(product.cartId)!;
            cartItem.quantity++;
            this.updateSubtotal(cartItem);
        } else {
            const data = this.updateSubtotal(product);
            this._cartMap.set(product.cartId, data);
        }

        // 发射事件
        this.emitChange();
    }

    /**
     * @desc 触发更新
     */
    private applyQuantityChange(item: ShopCartProduct, newQuantity: number): void {
        item.quantity = newQuantity;
        this.updateSubtotal(item);
        this.emitChange();
    }

    /**
     * @desc 增加商品数量
     * @param cartId 商品唯一ID
     * @param delta 减少数量（默认 1）
     * @returns CartUpdateResult
     */
    increaseQuantity(cartId: string, delta = 1): CartUpdateResult {
        const cartItem = this._cartMap.get(cartId);
        if (!cartItem) {
            return CartUpdateResult.NotFound;
        }
        if (delta <= 0) {
            return CartUpdateResult.InvalidDelta;
        }

        let newQuantity = cartItem.quantity + delta;

        // 处理数量溢出
        if (newQuantity > this.maxCartCount) {
            newQuantity = this.maxCartCount;
        }

        // 更新
        this.applyQuantityChange(cartItem, newQuantity);

        return newQuantity >= this.maxCartCount
            ? CartUpdateResult.LimitReached
            : CartUpdateResult.Updated;
    }

    /**
     *  @desc 减少商品数量
     *  @param cartId 商品唯一ID
     *  @param delta 减少数量（默认 1）
     *  @returns CartUpdateResult
     */
    decreaseQuantity(cartId: string, delta = 1): CartUpdateResult {
        const cartItem = this._cartMap.get(cartId);
        if (!cartItem) {
            return CartUpdateResult.NotFound;
        }

        // 防止非法 delta
        if (delta <= 0) {
            return CartUpdateResult.InvalidDelta;
        }

        const newQuantity = cartItem.quantity - delta;

        // 若减少后小于等于0，则提示删除
        if (newQuantity <= 0) {
            return CartUpdateResult.Deleted;
        }
        // 更新
        this.applyQuantityChange(cartItem, newQuantity);

        return CartUpdateResult.Updated;
    }

    /**
     * @desc 移除单个商品
     */
    removeFromCart(cartId: string) {
        this._cartMap.delete(cartId);
        this.emitChange();
    }

    /**
     * @desc 清空
     */
    clearCart() {
        // 清空购物车商品项Map
        this._cartMap.clear();
        // 清空小费
        this._tip.set(0);
        this.emitChange();
    }
}
