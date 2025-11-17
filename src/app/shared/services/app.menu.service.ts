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
import { StoreTaxGroupVO } from '@app/shared/types/store.shared.types';

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
    // 税率组- 税率组编码 - 税率组信息
    private _taxGroupMap = signal<Map<string, StoreTaxGroupVO>>(new Map());
    private taxGroup = signal<StoreTaxGroupVO[]>([]);
    private categoryList = signal<MenuCategoryItem[]>([]);
    private menu = signal<MenuResponseVo[]>([]);
    // 菜单全量数据
    private _menuData = signal<Menu | null>(null);
    // 是否初始化完成
    private initialized = false;

    constructor(private mqttService: MqttService) {
        super();

        this.mqttService.getMessageObservable().subscribe((message) => {
            switch (message['type']) {
                case AppMqttEnums.MENU_PUBLISH:
                case AppMqttEnums.MENU_LOW_UP:
                case AppMqttEnums.MENU_SELL_0UT:
                    console.log('MenuService MQTT 收到消息:', JSON.stringify(message));
                    this.getRemoteMenu().catch((err) => console.error('获取菜单失败:', err));
                    break;
            }
        });

        // 自动持久化
        this.setupPersistence();
    }

    // 分类id-下标
    readonly categoryIndexMap = computed(() => {
        const map = new Map<string, number>();
        this.categoryListValue().forEach((t, index) => {
            map.set(t.categoryId, index);
        });
        return map;
    });
    // 分类-商品Map
    readonly menuMapValue = computed(() => this.menuMap());
    // 商品ID-商品信息Map
    readonly menuIdMapValue = computed(() => this.menuIdMap());
    // 分类列表
    readonly categoryListValue = computed(() =>
        this.categoryList().filter((t) => t.categoryId !== '-1'),
    );
    // 分类Map
    readonly categoryMapValue = computed(() => this.menuCategory());

    /**
     * @desc 通过编码获取税率组信息
     */
    getTaxGroupByCode(taxCode: string | undefined) {
        return this._taxGroupMap().get(taxCode ?? '');
    }

    async init() {
        if (this.initialized) return;

        // 优先读取缓存
        const hasMenu = await LocalStorage.isExist(CacheKey.MENU_LIST);
        if (hasMenu) {
            await this.readPersistence();
        }

        await this.getRemoteMenu().catch((error) => console.error(error));

        this.initialized = true;
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
        if (res.success && JSON.stringify(res.data) !== JSON.stringify(this._menuData())) {
            // 更新菜单全量数据
            this._menuData.set(res.data);
            // 更新菜单列表
            this.menu.set(res.data.menuResponseVo || []);
            // 更新分类列表
            this.categoryList.set(res.data.categoriesVos || []);
            // 更新税率组列表
            this.taxGroup.set(res.data.taxGroupVos || []);
        }
    }

    /**
     * @desc 本地固化
     */
    private setupPersistence() {
        effect(() => {
            const taxGroup = this.taxGroup();
            if (taxGroup.length > 0) {
                LocalStorage.setItem(CacheKey.MENU_TAX_GROUP, JSON.stringify(taxGroup)).catch(
                    (err) => console.error('存储税率组失败:', err),
                );
                // 更新税率组map
                this._taxGroupMap.set(
                    new Map(taxGroup.map((item) => [item.groupCode || '', item])),
                );
            }
        });
        effect(() => {
            const categories = this.categoryList();
            if (categories.length > 0) {
                LocalStorage.setItem(CacheKey.MENU_CATEGORY, JSON.stringify(categories)).catch(
                    (err) => console.error('存储分类失败:', err),
                );
                // 更新分类map
                this.updateMenuCategory(categories);
            }
        });

        effect(() => {
            const menu = this.menu();
            if (menu.length > 0) {
                LocalStorage.setItem(CacheKey.MENU, JSON.stringify(menu)).catch((err) =>
                    console.error('存储菜单失败:', err),
                );
                // 更新菜单map
                this.updateMenuMap(menu);
            }
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
            const [categories, menuMap, taxGroup] = (await Promise.all([
                LocalStorage.getItem(CacheKey.MENU_CATEGORY),
                LocalStorage.getItem(CacheKey.MENU_LIST),
                LocalStorage.getItem(CacheKey.MENU_TAX_GROUP),
            ])) as [string | null, string | null, string | null];

            if (categories) {
                this.categoryList.set(JSON.parse(categories) as MenuCategoryItem[]);
            }

            if (menuMap) {
                const data: MenuResponseVo[] = JSON.parse(menuMap);
                this.updateMenuMap(data);
            }

            if (taxGroup) {
                const data: StoreTaxGroupVO[] = JSON.parse(taxGroup);
                this.taxGroup.set(data);
            }
        } catch (error) {
            console.error('从缓存加载失败:', error);
        }
    }
}
