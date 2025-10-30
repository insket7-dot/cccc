import { Injectable, signal, computed, effect } from '@angular/core';
import {
    Menu,
    MenuCategoryItem,
    menuListItem,
    MenuResponseVo,
} from '@app/shared/types/menu.shared.types';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';
import { AppUrl } from '@app/core/constants/app.url';
import { MqttService } from '@app/core/services/mqtt.service';
import { AppMqttEnums } from '@app/shared/constants/app.enums';
import { CartService } from '@app/shared/services/cart.service';

@Injectable({
    providedIn: 'root',
})
export class AppMenuService extends AbstractAppService {
    // 分类ID-菜单数据列表
    private menuMap = signal<Map<string, menuListItem[]>>(new Map());
    // 菜单ID-商品信息
    private menuIdMap = signal<Map<string, menuListItem>>(new Map());
    // 分类ID-分类信息
    private menuCategory = signal<Map<string, MenuCategoryItem>>(new Map());
    private categoryList = signal<MenuCategoryItem[]>([]);
    private currentCategory = signal<string>('');
    private menu = signal<MenuResponseVo[]>([]);

    constructor(
        private mqttService: MqttService,
        private cartService: CartService,
    ) {
        super();

        this.mqttService.getMessageObservable().subscribe((message) => {
            switch (message['type']) {
                case AppMqttEnums.MENU_PUBLISH:
                case AppMqttEnums.MENU_LOW_UP:
                case AppMqttEnums.MENU_SELL_0UT:
                    this.getRemoteMenu().catch((err) => console.error('获取菜单失败:', err));
                    break;
            }
        });

        // 自动持久化
        this.setupPersistence();
    }

    // 分类-商品Map
    readonly menuMapValue = computed(() => this.menuMap());
    // 商品ID-商品信息Map
    readonly menuIdMapValue = computed(() => this.menuIdMap());
    // 分类列表
    readonly categoryListValue = computed(() => this.categoryList());
    // 当前选择的分类
    readonly currentCategoryValue = computed(() => this.getCurrentCategory());
    // 当前分类下得菜品列表
    readonly currentMenuValue = computed(() => this.getCurrentMenu());
    // 菜品整体渲染列表（分类-菜单列表）
    readonly menuValue = computed(() => this.getMenusAsResponse());
    // 已加购的商品列表
    readonly cartListValue = computed(() => {
        const menuMap = this.menuIdMap();
        const cartMap = this.cartService.cartMap();
        return Array.from(cartMap.values()).filter((item) => menuMap.has(item.id));
    });

    /**
     * @desc 结合购物车重新组装页面渲染数据
     */
    getMenusAsResponse(): MenuResponseVo[] {
        const categoryMap = this.menuCategory();
        const menuMap = this.menuMapValue();
        const cartMap = this.cartService.cartMap();

        const result: MenuResponseVo[] = [];

        for (const [categoryId, list] of menuMap.entries()) {
            const categoryInfo = categoryMap.get(categoryId);
            const mergedMenuList = list.map((menuItem) => {
                const cartItem = cartMap.get(String(menuItem.id));
                return {
                    ...menuItem,
                    quantity: cartItem?.quantity ?? 0, // 动态合并数量
                };
            });

            result.push({
                categoryId,
                categoryName: categoryInfo?.categoryNameCn,
                id: categoryInfo?.id ?? 0,
                parentId: categoryInfo?.parentId ?? 0,
                menuVoList: mergedMenuList,
            });
        }
        console.log('menu list result:', result);
        return result;
    }

    /**
     * @desc 更新分类ID
     */
    setCurrentCategory(id: string) {
        this.currentCategory.set(id);
    }

    async init() {
        // 优先读取缓存
        const hasMenu = await LocalStorage.isExist(CacheKey.MENU_LIST);
        if (hasMenu) {
            void this.readPersistence();
        }
        this.getRemoteMenu().catch((error) => console.error(error));
    }

    private getCurrentCategory(): string {
        const explicitCategory = this.currentCategory();
        const categories = this.categoryList();
        const menuMap = this.menuMap();

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
        return this.menuMap().get(categoryId) || [];
    }

    // 设置map
    private updateMenuMap(data: MenuResponseVo[]) {
        const tempMenuMap = new Map<string, menuListItem[]>();
        const productMap = new Map<string, menuListItem>();
        data.forEach((item) => {
            tempMenuMap.set(item.categoryId, item.menuVoList);

            // 添加商品的map
            item.menuVoList.forEach((menuItem) => {
                productMap.set(menuItem.productId, menuItem);
            });
        });

        const categories = this.categoryList();

        const orderedMenuMap = new Map<string, menuListItem[]>();
        categories.forEach((category) => {
            const menuItems = tempMenuMap.get(category.categoryId) || [];
            orderedMenuMap.set(category.categoryId, menuItems);
        });

        // 设置分类-菜单列表
        this.menuMap.set(orderedMenuMap);
        // 设置商品ID-商品信息
        this.menuIdMap.set(productMap);
    }

    /**
     * @desc 设置分类map
     */
    private updateMenuCategory(data: MenuCategoryItem[]) {
        const categoryMap = new Map<string, MenuCategoryItem>();
        data.forEach((item) => {
            categoryMap.set(item.categoryId, item);
        });
        this.menuCategory.set(categoryMap);
    }

    /**
     * @desc 远程更新菜单
     */
    async getRemoteMenu() {
        let res = await this.request<Menu>(AppUrl.STORE_MENU);
        console.log('获取门店菜单成功:', JSON.stringify(res));
        if (res.success) {
            // 先清空map数据
            this.menuMap.set(new Map());
            this.menuIdMap.set(new Map());
            this.menuCategory.set(new Map());

            const menuList = res.data.menuResponseVo || [];
            this.menu.set(menuList);

            const categories = res.data.categoriesVos || [];
            this.categoryList.set(categories);

            this.updateMenuCategory(categories);
            this.updateMenuMap(menuList);
        }
    }

    /**
     * @desc 本地固化
     */
    private setupPersistence() {
        effect(() => {
            const categories = this.categoryList();
            LocalStorage.setItem(CacheKey.MENU_CATEGORY, JSON.stringify(categories)).catch((err) =>
                console.error('存储分类失败:', err),
            );
        });

        effect(() => {
            const menu = this.menu();
            LocalStorage.setItem(CacheKey.MENU, JSON.stringify(menu)).catch((err) =>
                console.error('存储菜单失败:', err),
            );
        });

        effect(() => {
            const menuMap = this.menuMap();
            const serializableData = Array.from(menuMap.entries()).map(([categoryId, items]) => ({
                categoryId,
                menuVoList: items,
            }));
            LocalStorage.setItem(CacheKey.MENU_LIST, JSON.stringify(serializableData)).catch(
                (err) => console.error('存储菜单失败:', err),
            );
        });
    }

    /**
     * @desc 读取本地缓存
     */
    private async readPersistence() {
        try {
            const [categories, menuMap] = (await Promise.all([
                LocalStorage.getItem(CacheKey.MENU_CATEGORY),
                LocalStorage.getItem(CacheKey.MENU_LIST),
            ])) as [string | null, string | null];
            if (categories) this.categoryList.set(JSON.parse(categories) as MenuCategoryItem[]);
            if (menuMap) {
                const data: MenuResponseVo[] = JSON.parse(menuMap);
                this.updateMenuMap(data);
            }
        } catch (error) {
            console.error('从缓存加载失败:', error);
        }
    }
}
