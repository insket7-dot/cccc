import { InjectionToken } from '@angular/core';
import type { AppUrl } from '../constants/app.url';

export const APP_URLS = new InjectionToken<typeof AppUrl>('APP_URLS');
