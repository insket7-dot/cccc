import {
    AbstractService,
    EventManager,
    RequestHeader,
    ResultVO,
    Url,
} from '@rydeen/angular-framework';
import { inject } from '@angular/core';
import { AppEvent } from '../../core/constants/app.event';
import { ModelStateService } from '@app/core/services/model-state.service';


export abstract class AbstractAppService extends AbstractService {
    private readonly eventManager = inject(EventManager);
    private readonly modelStateService = inject(ModelStateService);

    get deviceId() {
        return this.modelStateService.deviceId();
    }


    override async request<T>(url: Url, body?: any, header?: RequestHeader): Promise<ResultVO<T>> {

        this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, true);
        return await super.request<T>(url, {...body,deviceCode:this.deviceId}, header, async () => {
            this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, false);
        });
    }
}
