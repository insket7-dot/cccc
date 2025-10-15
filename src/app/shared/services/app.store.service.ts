import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { computed, effect, Injectable, signal } from '@angular/core';
import { StoreInfo } from '@app/shared/types/store.shared.types';
import { AppUrl } from '@app/core/constants/app.url';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';

@Injectable({
    providedIn: 'root',
})
export class AppStoreService extends AbstractAppService {
    private storeInfo = signal<StoreInfo | null>(null);

    constructor() {
        super();

        effect(() => {
            const info = this.storeInfo();
            if (info) {
                LocalStorage.setItem(CacheKey.STORE_INFO, JSON.stringify(info)).catch((err) =>
                    console.error('存储店铺信息失败:', err),
                );
            }
        });
    }

    readonly storeInfoValue = computed(() => this.storeInfo());

    async init() {
        // 优先读取缓存
        const hasStoreInfo = await LocalStorage.isExist(CacheKey.STORE_INFO);
        if (hasStoreInfo) {
            void this.readPersistence();
        }
        this.getRemoteStoreInfo().catch((err) => console.error('获取门店信息失败:', err));
    }

    /**
     * @desc 远程更新门店数据
     */
    async getRemoteStoreInfo() {
        const res = await this.request<StoreInfo>(AppUrl.STORE_INFO);
        if (res.success) {
            this.storeInfo.set(res.data);
        }
    }

    /**
     * @desc 读取本地缓存
     */
    private async readPersistence() {
        try {
            const [storeInfo] = (await Promise.all([
                LocalStorage.getItem(CacheKey.STORE_INFO),
            ])) as [string | null];
            if (storeInfo) this.storeInfo.set(JSON.parse(storeInfo) as StoreInfo);
        } catch (error) {
            console.error('从缓存加载失败:', error);
        }
    }
}
