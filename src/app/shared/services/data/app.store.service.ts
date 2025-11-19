import { Injectable, signal, computed, effect } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';
import { AppUrl } from '@app/core/constants/app.url';
import {
    StoreBusTimeInterface,
    CarouselImage,
    StoreBaseInfoInterface,
    CarouselImageResponseVO,
    ChangeTime,
    StoreTaxGroupVO,
    TrdMasterStoreExtraChangeInfoVo,
} from '@app/shared/types/store.shared.types';
import { DateUtils } from '@app/shared/services/util/date-utils.service';
import { MqttService } from '@app/core/services/mqtt.service';
import { AppMqttEnums } from '@app/shared/constants/app.enums';
import { ExtraChargeTypeEnum } from '@app/shared/constants/tax.enums';
import { StoreCarouselConstants } from '@app/shared/constants/app.constants';

@Injectable({
    providedIn: 'root',
})
export class AppStoreService extends AbstractAppService {
    private carouselImages = signal<CarouselImage[]>([]);
    private storeBusTime = signal<StoreBusTimeInterface | null>(null);
    private storeBaseInfo = signal<StoreBaseInfoInterface | null>(null);
    private initialized = false;
    // 税率组Map - 键为税率组编码，值为税率组对象
    private _taxGroup = signal<Map<string, StoreTaxGroupVO>>(new Map());
    // 附加费税率组Map - 键为税率组编码，值为税率组对象
    private _extraChange = signal<Map<string, TrdMasterStoreExtraChangeInfoVo>>(new Map());

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

    // 轮播图
    readonly carouselImagesValue = computed(() => this.carouselImages());
    // 营业时间
    readonly storeBusTimeValue = computed(() => this.storeBusTime());
    // 门店全量信息
    readonly storeBaseInfoValue = computed(() => this.storeBaseInfo());
    // 附加费税率组 - 已过滤
    readonly extraChangeValue = computed(() => {
        // 过滤订单附加费
        const list = (this.storeBaseInfo()?.extraChange || [])
            .filter((t) => t.extraChargeType === ExtraChargeTypeEnum.ORDER)
            .filter((t) => this.isNowInValidity(t.validityTime ?? []));
        // 当前点餐模式
        const type = this.modelStateService.curWayValue();
        if (type) {
            return list.filter((t) => t.useOrderType?.includes(type));
        }
        return list;
    });
    // 税率组
    readonly taxGroupValue = computed(() => this.storeBaseInfo()?.taxGroup);

    async init() {
        if (this.initialized) return;

        await this.readPersistence();

        await Promise.allSettled([
            this.getRemoteStoreBusTime(),
            this.getRemoteCarouselImages(),
            this.getRemoteStoreBaseInfo(),
        ]);

        this.initialized = true;
    }

    /**
     * @desc 判定门店税率和菜品税率是否一致
     */
    isTaxGroupSame(groupCode: string) {
        if (!groupCode) return false;

        return this.storeBaseInfoValue()?.taxGroupCode === groupCode;
    }

    /**
     * @desc 根据税率组编码获取税率组
     */
    getGroupByCode(code: string) {
        return this._taxGroup().get(code);
    }

    /**
     * @desc 过滤附加费税率组是否在当前时间范围内
     */
    isNowInValidity(validityTime: ChangeTime[]): boolean {
        // 没有有效期，默认有效
        if (!validityTime || validityTime.length === 0) return true;

        const now = new Date();
        return validityTime.some((item) => {
            const start = new Date(item.startTime);
            const end = new Date(item.endTime);

            return now >= start && now <= end;
        });
    }

    /**
     * @desc 远程门店轮播图列表
     */
    async getRemoteCarouselImages() {
        const res = await this.request<CarouselImageResponseVO[]>(AppUrl.GET_RESOURCE, {
            pageCode: StoreCarouselConstants.PAGE_CODE,
            operationAreaCode: StoreCarouselConstants.OPERATION_AREA_CODE,
            nowDate: this.dateUtils.formatDateTime(new Date()),
        });
        const data = res.data[0] || {};
        if (res.success && data?.pics) {
            const newImages: CarouselImage[] = data.pics ? JSON.parse(data.pics) : [];
            if (JSON.stringify(newImages) !== JSON.stringify(this.carouselImages())) {
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
        const data = res.data;
        if (res.success && JSON.stringify(data) !== JSON.stringify(this.storeBusTime())) {
            this.storeBusTime.set(data);
        }
    }

    /**
     * @desc 远程门店基础数据
     */
    async getRemoteStoreBaseInfo() {
        const res = await this.request<StoreBaseInfoInterface>(AppUrl.STORE_BASE_INFO);
        console.log('门店基础数据:', JSON.stringify(res));
        const data = res.data;
        if (res.success && JSON.stringify(data) !== JSON.stringify(this.storeBaseInfo())) {
            this.storeBaseInfo.set(data);
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
                // 设置税率组Map
                if (baseInfo.taxGroup) {
                    this._taxGroup.set(
                        new Map([[baseInfo.taxGroup.groupCode ?? '', baseInfo.taxGroup]]),
                    );
                }
                // 设置附加费税率组Map
                if (baseInfo.extraChange && baseInfo.extraChange.length) {
                    this._extraChange.set(
                        new Map(baseInfo.extraChange.map((t) => [t.id?.toString() ?? '', t])),
                    );
                }
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
