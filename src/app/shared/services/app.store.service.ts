import { Injectable, signal, computed, effect } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';
import { AppUrl } from '@app/core/constants/app.url';
import { StoreBusTimeInterface,CarouselImage,StoreBaseInfoInterface } from '@app/shared/types/store.shared.types';
import { DateUtils } from '@app/shared/utils/date-utils';



@Injectable({
    providedIn: 'root',
})
export class AppStoreService extends AbstractAppService {
    private carouselImages = signal<CarouselImage[]>([]);
    private storeBusTime = signal<StoreBusTimeInterface | null>(null);
    private storeBaseInfo = signal<StoreBaseInfoInterface | null>(null);

    constructor(private dateUtils: DateUtils) {
        super();
        this.setupCarouselPersistence();
        this.setupStorePersistence();
        this.setupStoreBaseInfoPersistence();
    }

    readonly carouselImagesValue = computed(() => this.carouselImages());
    readonly storeBusTimeValue = computed(() => this.storeBusTime());
    readonly storeBaseInfoValue = computed(() => this.storeBaseInfo());

    async init() {
        const [hasStoreBusTime, hasCarousel, hasStoreBaseInfo] = await Promise.all([
            LocalStorage.isExist(CacheKey.STORE_INFO),
            LocalStorage.isExist(CacheKey.CAROUSEL_IMAGES),
            LocalStorage.isExist(CacheKey.STORE_BASE_INFO),
        ]);
        if (hasStoreBusTime) void this.readStorePersistence();
        if (hasCarousel) void this.readCarouselPersistence();
        if (hasStoreBaseInfo) void this.readStoreBaseInfoPersistence();

        await Promise.all([
            this.getRemoteStoreBusTime().catch((err) => console.error('获取门店信息失败:', err)),
            this.getRemoteCarouselImages().catch((err) => console.error('获取轮播图失败:', err)),
            this.getRemoteStoreBaseInfo().catch((err) => console.error('获取门店基础信息失败:', err)),
        ]);
    }

    async getRemoteCarouselImages() {
        const res = await this.request<any>(AppUrl.GET_RESOURCE, {
            pageCode: 'page001',
            operationAreaCode: 'oper001',
            nowDate: this.dateUtils.formatDateTime(new Date()),
        });
        if (res.success && res.data?.length) {
            const newImages = JSON.parse(res.data[0].pics) as CarouselImage[];
            const currentImages = this.carouselImages();
            if (JSON.stringify(newImages) !== JSON.stringify(currentImages)) {
                this.carouselImages.set(newImages);
            }
        }
    }

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

    async getRemoteStoreBusTime() {
        const res = await this.request<StoreBusTimeInterface>(AppUrl.STORE_BUS_TIME);
        if (res.success) {
            this.storeBusTime.set(res.data);
        }
    }

    private async readStorePersistence() {
        try {
            const storeStr = await LocalStorage.getItem(CacheKey.STORE_INFO);
            if (storeStr) {
                this.storeBusTime.set(JSON.parse(storeStr as string) as StoreBusTimeInterface);
            }
        } catch (error) {
            console.error('从缓存加载门店信息失败:', error);
        }
    }

    private setupStorePersistence() {
        effect(() => {
            const info = this.storeBusTime();
            if (info) {
                LocalStorage.setItem(CacheKey.STORE_INFO, JSON.stringify(info)).catch((err) =>
                    console.error('存储店铺信息失败:', err)
                );
            }
        });
    }

    async getRemoteStoreBaseInfo() {
        const res = await this.request<StoreBaseInfoInterface>(AppUrl.STORE_BASEINFO);
        if (res.success) {
            this.storeBaseInfo.set(res.data);
        }
    }

    private async readStoreBaseInfoPersistence() {
        try {
            const baseInfoStr = await LocalStorage.getItem(CacheKey.STORE_BASE_INFO);
            if (baseInfoStr) {
                this.storeBaseInfo.set(JSON.parse(baseInfoStr as string) as StoreBaseInfoInterface);
            }
        } catch (error) {
            console.error('从缓存加载门店基础信息失败:', error);
        }
    }

    private setupStoreBaseInfoPersistence() {
        effect(() => {
            const baseInfo = this.storeBaseInfo();
            if (baseInfo) {
                LocalStorage.setItem(CacheKey.STORE_BASE_INFO, JSON.stringify(baseInfo)).catch((err) =>
                    console.error('存储门店基础信息失败:', err)
                );
            }
        });
    }
}
