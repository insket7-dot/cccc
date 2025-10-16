import { Injectable, signal, computed, effect } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';
import { AppUrl } from '@app/core/constants/app.url';
import { StoreInfo } from '@app/shared/types/store.shared.types'; // 导入新增的 CarouselImage 类型

interface CarouselImage {
    image: string;
    alt: string;
    index: number;
}

@Injectable({
    providedIn: 'root',
})
export class AppStoreService extends AbstractAppService {
    private carouselImages = signal<CarouselImage[]>([]);
    private storeInfo = signal<StoreInfo | null>(null);

    constructor() {
        super();
        this.setupCarouselPersistence();
        this.setupStorePersistence();
    }

    readonly carouselImagesValue = computed(() => this.carouselImages());
    readonly storeInfoValue = computed(() => this.storeInfo());

    async init() {
        const [hasStoreInfo, hasCarousel] = await Promise.all([
            LocalStorage.isExist(CacheKey.STORE_INFO),
            LocalStorage.isExist(CacheKey.CAROUSEL_IMAGES),
        ]);
        if (hasStoreInfo) void this.readStorePersistence();
        if (hasCarousel) void this.readCarouselPersistence();

        await Promise.all([
            this.getRemoteStoreInfo().catch((err) => console.error('获取门店信息失败:', err)),
            this.getRemoteCarouselImages().catch((err) => console.error('获取轮播图失败:', err)),
        ]);
    }

    async getRemoteCarouselImages() {
        const res = await this.request<any>(AppUrl.GET_RESOURCE, {
            pageCode: 'page001',
            operationAreaCode: 'oper001',
            nowDate: new Date().toISOString(),
        });
        if (res.success && res.data?.length) {
            const newImages = JSON.parse(res.data[0].pics) as CarouselImage[];
            const currentImages = this.carouselImages();
            if (JSON.stringify(newImages) !== JSON.stringify(currentImages)) {
                this.carouselImages.set(newImages);
            }
        }
    }

    /**
     * @desc 读取轮播图本地缓存
     */
    private async readCarouselPersistence() {
        try {
            const carouselStr = await LocalStorage.getItem(CacheKey.CAROUSEL_IMAGES);
            if (carouselStr) {
                const images = JSON.parse(carouselStr as string) as CarouselImage[];
                this.carouselImages.set(images);
            }
        } catch (error) {
            console.error('从缓存加载轮播图失败:', error);
        }
    }

    /**
     * @desc 轮播图数据自动持久化（监听信号变化）
     */
    private setupCarouselPersistence() {
        effect(() => {
            const images = this.carouselImages();
            if (images.length) {
                LocalStorage.setItem(CacheKey.CAROUSEL_IMAGES, JSON.stringify(images)).catch(
                    (err) => console.error('存储轮播图失败:', err)
                );
            }
        });
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
     * @desc 读取门店信息本地缓存
     */
    private async readStorePersistence() {
        try {
            const storeStr = await LocalStorage.getItem(CacheKey.STORE_INFO);
            if (storeStr) {
                this.storeInfo.set(JSON.parse(storeStr as string) as StoreInfo);
            }
        } catch (error) {
            console.error('从缓存加载门店信息失败:', error);
        }
    }

    /**
     * @desc 门店信息自动持久化
     */
    private setupStorePersistence() {
        effect(() => {
            const info = this.storeInfo();
            if (info) {
                LocalStorage.setItem(CacheKey.STORE_INFO, JSON.stringify(info)).catch((err) =>
                    console.error('存储店铺信息失败:', err)
                );
            }
        });
    }
}
