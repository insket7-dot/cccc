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
import { StoreInfo } from '@app/shared/types/store.shared.types';

@Injectable({
    providedIn: 'root',
})
export class AppMenuService extends AbstractAppService {
    private menuMap = signal<Map<string, menuListItem[]>>(new Map());
    private categoryList = signal<MenuCategoryItem[]>([]);
    private storeInfo = signal<StoreInfo | null>(null);
    private currentCategory = signal<string>('');

    constructor() {
        super();

        // 自动持久化
        this.setupPersistence();
    }

    readonly storeInfoValue = computed(() => this.storeInfo());
    readonly menuMapValue = computed(() => this.menuMap());
    readonly categoryListValue = computed(() => this.categoryList());
    readonly currentCategoryValue = computed(() => this.getCurrentCategory());
    readonly currentMenuValue = computed(() => this.getCurrentMenu());

    setCurrentCategory(id: string) {
        this.currentCategory.set(id);
    }

    async init() {
        await Promise.allSettled([this.getRemoteMenu(), this.getRemoteStoreInfo()]);
    }

    async getRemoteStoreInfo() {
        const res = await this.request<StoreInfo>(AppUrl.STORE_INFO);
        if (res.success) {
            this.storeInfo.set(res.data);
        }
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
        const menuMap = new Map<string, menuListItem[]>();
        data.forEach((item) => {
            menuMap.set(item.categoryId, item.menuVoList);
        });
        this.menuMap.set(menuMap);
    }

    private async getRemoteMenu() {
        let res = await this.request<Menu>(AppUrl.MENU_ALL_TW);
        console.log(res);
        if (res.success) {
            this.categoryList.set(res.data.categoriesVos || []);
            this.updateMenuMap(res.data.menuResponseVo);
        }
    }

    private setupPersistence() {
        effect(() => {
            const info = this.storeInfo();
            if (info) {
                LocalStorage.setItem(CacheKey.STORE_INFO, JSON.stringify(info)).catch((err) =>
                    console.error('存储店铺信息失败:', err),
                );
            }
        });

        effect(() => {
            const categories = this.categoryList();
            LocalStorage.setItem(CacheKey.MENU_CATEGORY, JSON.stringify(categories)).catch((err) =>
                console.error('存储分类失败:', err),
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
}
