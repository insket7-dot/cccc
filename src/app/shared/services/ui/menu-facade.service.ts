// 菜单UI服务
import { computed, Injectable, signal } from '@angular/core';
import { AppMenuService } from '@app/shared/services/data/app.menu.service';
import { CartService } from '@app/shared/services/cart/cart.service';
import { I18nTextService } from '@app/shared/services/util/i18n-text.service';
import { cartViewItem } from '@app/shared/types/cart.shared.types';
import { CategoryOperation, ProductType } from '@app/shared/constants/menu.constants';
import { menuListItem, MenuResponseVo } from '@app/shared/types/menu.shared.types';

@Injectable({ providedIn: 'root' })
export class MenuFacadeService {
    constructor(
        protected appMenuService: AppMenuService,
        private cartService: CartService,
        private readonly i18nTextService: I18nTextService,
    ) {}

    private DEFAULT_LOCK_TIME = 300;
    private scrollSyncLocked = signal(false);
    private currentCategory = signal<string>('');

    // 当前选择的分类
    readonly currentCategoryValue = computed(() => this.getCurrentCategory());
    // 当前分类下得菜品列表
    readonly currentMenuValue = computed(() => this.getCurrentMenu());
    // 菜品整体渲染列表（分类-菜单列表）
    readonly menuValue = computed(() =>
        this.getMenusAsResponse().filter((t) => t.categoryId !== '-1'),
    );
    readonly scrollSyncLockedValue = computed(() => this.scrollSyncLocked());

    // 已加购的商品列表
    readonly cartListValue = computed(() => {
        const menuMap = this.appMenuService.menuIdMapValue();
        const cartList = this.cartService.cartList();
        const cartListResult = cartList.map((item) => {
            const productInfo = structuredClone(menuMap.get(item.productId));
            const result: cartViewItem = {
                taxData: item.taxData ?? {}, // 税费数据
                cartId: item.cartId,
                productId: item.productId,
                productName: this.i18nTextService.get(productInfo, 'productName'),
                imageUrl: productInfo?.imageUrl ?? '',
                price: productInfo?.price ?? 0,
                productType: productInfo?.productType ?? ProductType.PRODUCT,
                quantity: item.quantity,
                subtotal: item.subtotal ?? 0,
            };

            // 单品
            if (item.productType === ProductType.PRODUCT) {
                // 规格
                if (item.skuId) {
                    result.spec = (productInfo?.specList || []).find(
                        (sku) => sku.skuId === item.skuId,
                    );
                }
                // 加料
                if (item.grillList) {
                    const list = item.grillList.map((grill) => {
                        const grillItem = (productInfo?.grillList || []).find(
                            (t) => t.grillCode === grill.grillId,
                        );
                        if (!grillItem) {
                            return null;
                        }
                        const targetProductIds = grill?.itemList.map((t) => t.productId);
                        grillItem.itemList =
                            grillItem?.itemList?.filter((t) =>
                                targetProductIds?.includes(t.productId),
                            ) ?? [];
                        // 后期放开数量限制后，可添加数量字段
                        return grillItem;
                    });
                    result.grill = list.filter((t) => t !== null);
                }
            }

            // 套餐-轮次
            if (item.productType === ProductType.COMBO) {
                const list = (item?.rounds ?? []).map((t) => {
                    const roundItem = (productInfo?.setMealList || []).find(
                        (x) => x.round === t.roundId,
                    );
                    if (!roundItem) {
                        return null;
                    }
                    const targetProductIds = t?.itemList.map((i) => i.skuId);
                    roundItem.itemList =
                        roundItem?.itemList?.filter((x) => targetProductIds?.includes(x.skuId)) ??
                        [];
                    return roundItem;
                });

                result.rounds = list.filter((t) => t !== null);
            }

            return result;
        });
        console.log('-------------------- cart list result ------------------', cartListResult);
        return cartListResult;
    });

    /**
     * @desc 结合购物车重新组装页面渲染数据
     */
    getMenusAsResponse(): MenuResponseVo[] {
        const categoryMap = this.appMenuService.categoryMapValue();
        const menuMap = this.appMenuService.menuMapValue();
        const cartList = this.cartService.cartList();

        const result: MenuResponseVo[] = [];

        for (const [categoryId, list] of menuMap.entries()) {
            const categoryInfo = categoryMap.get(categoryId);
            const mergedMenuList = list.map((menuItem) => {
                // 查询整个列表中同商品的总数量
                const sameProductQuantity = cartList
                    .filter((t) => t.productId === menuItem.productId)
                    .map((t) => t.quantity)
                    .reduce((acc, cur) => acc + cur, 0);
                return {
                    ...menuItem,
                    quantity: sameProductQuantity,
                };
            });

            result.push({
                categoryId,
                categoryName: this.i18nTextService.get(categoryInfo, 'categoryName'),
                id: categoryInfo?.id ?? 0,
                parentId: categoryInfo?.parentId ?? 0,
                menuVoList: mergedMenuList,
            });
        }
        return result;
    }

    /**
     * @desc 更新分类ID
     */
    setCurrentCategory(categoryId: string) {
        this.currentCategory.set(categoryId);
    }

    /**
     * @desc 设置滚动锁
     */
    setScrollSyncLocked(lock: boolean) {
        this.scrollSyncLocked.set(lock);
    }

    /**
     * @desc 分类点击设置ID
     */
    setCurrentCategoryByClick(categoryId: string) {
        this.setScrollSyncLocked(true);
        this.setCurrentCategory(categoryId);
        setTimeout(() => {
            this.setScrollSyncLocked(false);
        }, this.DEFAULT_LOCK_TIME);
    }

    /**
     * @desc 分类操作上下
     * @param type
     * @param loop 是否循环
     */
    categoryUpDown(type: CategoryOperation, loop: boolean = true) {
        this.setScrollSyncLocked(true);
        const categoryList = this.appMenuService.categoryListValue();
        const index = this.appMenuService.categoryIndexMap().get(this.currentCategoryValue());

        // 如果找不到 index，直接返回
        if (index === undefined || categoryList.length === 0) return;

        // 计算新的索引
        const offset = type === CategoryOperation.PREV ? -1 : 1;
        const newIndex = loop
            ? (index + offset + categoryList.length) % categoryList.length
            : Math.min(Math.max(index + offset, 0), categoryList.length - 1);

        // 切换分类
        const target = categoryList[newIndex];
        if (target) {
            this.setCurrentCategory(target.categoryId);
        }

        setTimeout(() => {
            this.setScrollSyncLocked(false);
        }, this.DEFAULT_LOCK_TIME);
    }

    private getCurrentCategory(): string {
        const explicitCategory = this.currentCategory();
        const categories = this.appMenuService.categoryListValue();
        const menuMap = this.appMenuService.menuMapValue();

        // 如果明确设置了且存在，就使用
        if (explicitCategory && menuMap.has(explicitCategory)) {
            return explicitCategory;
        }

        // 否则找第一个有菜单的分类
        const firstValidCategory = categories.find((cat) => menuMap.has(cat.categoryId));

        return firstValidCategory?.categoryId || '';
    }

    private getCurrentMenu(): menuListItem[] {
        const categoryId = this.getCurrentCategory();
        return this.appMenuService.menuMapValue().get(categoryId) || [];
    }
}
