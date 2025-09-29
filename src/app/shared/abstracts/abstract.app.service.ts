import {
    AbstractService,
    EventManager,
    RequestHeader,
    ResultVO,
    Url,
} from '@rydeen/angular-framework';
import { inject } from '@angular/core';
import { AppEvent } from '@app/core/constants/app.event';
import { ToastService } from '@app/shared/services/toast.service';
import { LogContext } from '@app/shared/services/log.context';

export abstract class AbstractAppService extends AbstractService {
    protected eventManager = inject(EventManager);
    protected toastService = inject(ToastService);
    protected logger = inject(LogContext);

    override async request<T>(url: Url, body?: any, header?: RequestHeader): Promise<ResultVO<T>> {
        this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, true);
        return await super.request<T>(url, body, header, async (value?: T) => {
            console.log(value);
            this.eventManager.publish(AppEvent.SHOW_GLOBAL_LOADING, false);
        });
    }
}
