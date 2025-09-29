import { AppEvent } from '@app/core/constants/app.event';
import { InjectionToken } from '@angular/core';

export const APP_EVENT = new InjectionToken<typeof AppEvent>('APP_EVENT');
