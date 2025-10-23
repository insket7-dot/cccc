import {
    AbstractService,
    EventManager,
    LocalStorage,
    RequestHeader,
    ResultVO,
    Url,
} from '@rydeen/angular-framework';
import { inject, signal } from '@angular/core';
import { AppEvent } from '@app/core/constants/app.event';
import { CacheKey } from '@app/shared/constants/cache.key';

export abstract class AbstractAppService extends AbstractService {
    private readonly eventManager = inject(EventManager);
    private deviceId = signal<string>('');
    private readonly initializationPromise: Promise<void> | null = null;

    constructor() {
        super();
        this.initializationPromise = this.loadDeviceId();
    }

    private async loadDeviceId(): Promise<void> {
        try {
            const id: string | null = await LocalStorage.getItem(CacheKey.DEVICE_ID);
            console.log('初始化设备ID:', id);
            if (id) {
                this.deviceId.set(id);
            }
        } catch (error) {
            console.error('读取设备ID失败:', error);
        }
    }

    override async request<T>(url: Url, body?: any, header?: RequestHeader): Promise<ResultVO<T>> {
        if (!this.initializationPromise) {
            console.error('请先初始化设备ID');
        }
        if (!['HEART_BEAT'].includes(url.name)) {
            this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, true);
        }
        return await super.request<T>(
            url,
            { ...body, deviceCode: this.deviceId() },
            header,
            async () => {
                this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, false);
            },
        );
    }
}
