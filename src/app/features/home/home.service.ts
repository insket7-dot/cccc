import {Injectable} from '@angular/core';
import {AbstractAppService} from '../../../commons/component/abstract.app.service';
import {AppUrl} from '../../app.url';
import {ResultVO} from '@rydeen/angular-framework';
import {MenuData} from '../../../commons/types/menu.types';

@Injectable({providedIn: 'root'})
export class HomeService extends AbstractAppService {

    async fetchAllMenu(): Promise<ResultVO<MenuData[]>> {
        return await this.request<MenuData[]>(AppUrl.MENU_ALL);
    }

}


