import { Injectable } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { AppUrlService } from '@app/shared/services/util/app.url.service';

@Injectable({ providedIn: 'root' })
export class ScreenService extends AbstractAppService {
    constructor(private readonly appUrlService: AppUrlService) {
        super();
    }

    getResource(param: any) {
        return this.request<any>(this.appUrlService.getApiUrl('GET_RESOURCE'), param);
    }
}
