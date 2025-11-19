import { Injectable } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { AppUrlService } from '@app/shared/services/util/app.url.service';

@Injectable({ providedIn: 'root' })
export class LoginService extends AbstractAppService {
    constructor(private appUrlService: AppUrlService) {
        super();
    }

    bingDevice(params: { storeCode: string; authCode: string }) {
        return this.request<string>(this.appUrlService.getApiUrl('BIND_DEVICE'), params);
    }
}
