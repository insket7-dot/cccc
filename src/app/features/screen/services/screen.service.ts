import { Injectable } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { AppUrl } from '@app/core/constants/app.url';
import { ResultVO } from '@rydeen/angular-framework';

@Injectable({ providedIn: 'root' })
export class ScreenService extends AbstractAppService {
    getResource(param:any): Promise<ResultVO<any>> {
        return this.request(AppUrl.GET_RESOURCE,param);
    }
}
