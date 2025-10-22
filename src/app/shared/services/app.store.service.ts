import { Injectable, signal, computed, effect } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';
import { AppUrl } from '@app/core/constants/app.url';
import {
    StoreBusTimeInterface,
    CarouselImage,
    StoreBaseInfoInterface,
} from '@app/shared/types/store.shared.types';
import { DateUtils } from '@app/shared/services/date-utils.service';
import { MqttService } from '@app/core/services/mqtt.service';
import { AppMqttEnums } from '@app/shared/constants/app.enums';

@Injectable({
    providedIn: 'root',
})
export class AppStoreService extends AbstractAppService {
    private carouselImages = signal<CarouselImage[]>([]);
    private storeBusTime = signal<StoreBusTimeInterface | null>(null);
    private storeBaseInfo = signal<StoreBaseInfoInterface | null>(null);

    constructor(
        private dateUtils: DateUtils,
        private mqttService: MqttService,
    ) {
        super();

        this.mqttService.getMessageObservable().subscribe((message) => {
            console.log('Store MQTT 收到消息:', JSON.stringify(message));
            switch (message['type']) {
                case AppMqttEnums.STORE_INF0:
                    if (message.data) {
                        this.storeBaseInfo.set(message.data as StoreBaseInfoInterface);
                    }
                    break;
                case AppMqttEnums.STORE_BUSINESS_TIME_STATUS:
                    if (message.data) {
                        this.storeBusTime.set(message.data as StoreBusTimeInterface);
                    }
                    break;
                case AppMqttEnums.STORE_CAROUSEL_UPDATE:
                    this.getRemoteCarouselImages().catch((err) =>
                        console.error('获取轮播图失败:', err),
                    );
                    break;
            }
        });

        this.setupPersistence();
    }

    readonly carouselImagesValue = computed(() => this.carouselImages());
    readonly storeBusTimeValue = computed(() => this.storeBusTime());
    readonly storeBaseInfoValue = computed(() => this.storeBaseInfo());

    async init() {
        await this.readPersistence();

        await Promise.all([
            this.getRemoteStoreBusTime().catch((err) => console.error('获取门店信息失败:', err)),
            this.getRemoteCarouselImages().catch((err) => console.error('获取轮播图失败:', err)),
            this.getRemoteStoreBaseInfo().catch((err) =>
                console.error('获取门店基础信息失败:', err),
            ),
        ]);
    }

    /**
     * @desc 远程门店轮播图列表
     */
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

    /**
     * @desc 远程门店营业时间
     */
    async getRemoteStoreBusTime() {
        const res = await this.request<StoreBusTimeInterface>(AppUrl.STORE_BUS_TIME);
        console.log('营业时间:', JSON.stringify(res));
        if (res.success) {
            this.storeBusTime.set(res.data);
        }
    }

    /**
     * @desc 远程门店基础数据
     */
    async getRemoteStoreBaseInfo() {
        const res = await this.request<StoreBaseInfoInterface>(AppUrl.STORE_BASE_INFO);
        console.log('门店基础数据:', JSON.stringify(res));
        if (res.success) {
            this.storeBaseInfo.set(res.data);
        }
    }

    /**
     * @desc 读取本地缓存
     */
    private async readPersistence() {
        try {
            const [hasStoreBusTime, hasCarousel, hasStoreBaseInfo] = await Promise.all([
                LocalStorage.isExist(CacheKey.STORE_BUS_TIMES),
                LocalStorage.isExist(CacheKey.CAROUSEL_IMAGES),
                LocalStorage.isExist(CacheKey.STORE_BASE_INFO),
            ]);

            if (hasStoreBusTime) {
                const storeBusTime: string | null = await LocalStorage.getItem(
                    CacheKey.STORE_BUS_TIMES,
                );
                if (storeBusTime) {
                    this.storeBusTime.set(JSON.parse(storeBusTime) as StoreBusTimeInterface);
                }
            }
            if (hasCarousel) {
                const carouselStr: string | null = await LocalStorage.getItem(
                    CacheKey.CAROUSEL_IMAGES,
                );
                if (carouselStr) {
                    this.carouselImages.set(JSON.parse(carouselStr) as CarouselImage[]);
                }
            }
            if (hasStoreBaseInfo) {
                const baseInfoStr: string | null = await LocalStorage.getItem(
                    CacheKey.STORE_BASE_INFO,
                );
                if (baseInfoStr) {
                    this.storeBaseInfo.set(JSON.parse(baseInfoStr) as StoreBaseInfoInterface);
                }
            }
        } catch (error) {
            console.error('从缓存加载失败:', error);
        }
    }

    /**
     * @desc 本地固化
     */
    private setupPersistence() {
        effect(() => {
            const baseInfo = this.storeBaseInfo();
            if (baseInfo) {
                LocalStorage.setItem(CacheKey.STORE_BASE_INFO, JSON.stringify(baseInfo)).catch(
                    (err) => console.error('存储门店基础信息失败:', err),
                );
            }
        });

        effect(() => {
            const storeBusTime = this.storeBusTime();
            if (storeBusTime) {
                LocalStorage.setItem(CacheKey.STORE_BUS_TIMES, JSON.stringify(storeBusTime)).catch(
                    (err) => console.error('存储店铺信息失败:', err),
                );
            }
        });

        effect(() => {
            const images = this.carouselImages();
            if (images.length) {
                LocalStorage.setItem(CacheKey.CAROUSEL_IMAGES, JSON.stringify(images)).catch(
                    (err) => console.error('存储轮播图失败:', err),
                );
            }
        });
    }
}
