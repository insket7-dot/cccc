import {
    AbstractService,
    EventManager,
    LocalStorage,
    RequestHeader,
    ResultVO,
    Url,
} from '@rydeen/angular-framework';
import { inject, signal, effect } from '@angular/core';
import { AppEvent } from '@app/core/constants/app.event';
import { CacheKey } from '@app/shared/constants/cache.key';

export abstract class AbstractAppService extends AbstractService {
    private readonly eventManager = inject(EventManager);
    private deviceId = signal<string>('no_device_id');

    constructor() {
        super();

        effect(async () => {
            const id = await this.getLocalDeviceId();
            console.log('request read device id', id);
            if (id) {
                this.deviceId.set(id);
            }
        });
    }

    private async getLocalDeviceId(): Promise<string | null> {
        return await LocalStorage.getItem(CacheKey.DEVICE_ID);
    }

    override async request<T>(url: Url, body?: any, header?: RequestHeader): Promise<ResultVO<T>> {
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
