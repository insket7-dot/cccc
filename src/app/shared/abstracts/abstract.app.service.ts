import {
    AbstractService,
    EventManager,
    RequestHeader,
    ResultVO,
    Url,
} from '@rydeen/angular-framework';
import { inject } from '@angular/core';
import { AppEvent } from '../../core/constants/app.event';

export abstract class AbstractAppService extends AbstractService {
    private readonly eventManager = inject(EventManager);

    override async request<T>(url: Url, body?: any, header?: RequestHeader): Promise<ResultVO<T>> {
        this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, true);
        return await super.request<T>(url, body, header, async () => {
            this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, false);
        });
    }
}
