import {
    AbstractComponent,
    ConfirmListener,
    EventManager,
    MessageOptions,
    MessageParam,
} from '@rydeen/angular-framework';
import { inject } from '@angular/core';
import { APP_EVENT } from '@app/core/tokens/app.event.token';
import { SysUtils } from '@app/shared/commons/sys.utils';
import { ToastService } from '@app/shared/services/toast.service';
import { LogContext } from '@app/shared/services/log.context';

export abstract class AbstractPage extends AbstractComponent {
    protected readonly eventManager: EventManager = inject(EventManager);
    protected appEvent = inject(APP_EVENT);
    protected sysUtils = inject(SysUtils);
    protected toastService = inject(ToastService);
    protected logger = inject(LogContext);

    override info(message: string, options?: MessageOptions): Promise<void> {
        void this.toastService.info(message, options);
        return Promise.resolve();
    }

    override error(message: string, options?: MessageOptions): Promise<void> {
        void this.toastService.error(message, options);
        return Promise.resolve();
    }

    override warn(message: string, options?: MessageOptions): Promise<void> {
        void this.toastService.warn(message, options);
        return Promise.resolve();
    }

    override success(message: string, options?: MessageOptions): Promise<void> {
        void this.toastService.success(message, options);
        return Promise.resolve();
    }

    override async confirm(
        messageId: string,
        messageParams?: MessageParam,
        confirmListener?: ConfirmListener,
    ): Promise<void> {
        void this.toastService.confirm(messageId, messageParams, confirmListener);
        return Promise.resolve();
    }
}
