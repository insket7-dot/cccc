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

@Injectable({
    providedIn: 'root',
})
export class AppMenuService extends AbstractAppService {
    private menuMap = signal<Map<string, menuListItem[]>>(new Map());
    private categoryList = signal<MenuCategoryItem[]>([]);
    private currentCategory = signal<string>('');

    constructor(private mqttService: MqttService) {
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

    readonly menuMapValue = computed(() => this.menuMap());
    readonly categoryListValue = computed(() => this.categoryList());
    readonly currentCategoryValue = computed(() => this.getCurrentCategory());
    readonly currentMenuValue = computed(() => this.getCurrentMenu());

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
        // if (explicitCategory && menuMap.has(explicitCategory)) {
        return explicitCategory;
        // }

        // // 否则找第一个有菜单的分类
        // const firstValidCategory = categories.find((cat) => menuMap.has(cat.categoryId));

        // return firstValidCategory?.categoryId || '';
    }

    private getCurrentMenu(): menuListItem[] {
        const categoryId = this.getCurrentCategory();
        return this.menuMap().get(categoryId) || [];
    }

    // 设置map
    private updateMenuMap(data: MenuResponseVo[]) {
        const tempMenuMap = new Map<string, menuListItem[]>();
        data.forEach((item) => {
            tempMenuMap.set(item.categoryId, item.menuVoList);
        });

        const categories = this.categoryList();

        const orderedMenuMap = new Map<string, menuListItem[]>();
        categories.forEach((category) => {
            const menuItems = tempMenuMap.get(category.categoryId) || [];
            orderedMenuMap.set(category.categoryId, menuItems);
        });

        this.menuMap.set(orderedMenuMap);
    }

    /**
     * @desc 远程更新菜单
     */
    async getRemoteMenu() {
        let res = await this.request<Menu>(AppUrl.STORE_MENU);
        console.log('获取门店菜单成功:', JSON.stringify(res));
        if (res.success) {
            this.categoryList.set(res.data.categoriesVos || []);
            this.updateMenuMap(res.data.menuResponseVo);
        }
    }

    /**
     * @desc 本地固化
     */
    private setupPersistence() {
        effect(() => {
            const categories = this.categoryList();
            LocalStorage.setItem(CacheKey.MENU_CATEGORY, JSON.stringify(categories)).catch((err) =>
                console.error('存储分类失败:', err)
            );
        });

        effect(() => {
            const menuMap = this.menuMap();
            const serializableData = Array.from(menuMap.entries()).map(([categoryId, items]) => ({
                categoryId,
                menuVoList: items,
            }));
            LocalStorage.setItem(CacheKey.MENU_LIST, JSON.stringify(serializableData)).catch(
                (err) => console.error('存储菜单失败:', err)
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
