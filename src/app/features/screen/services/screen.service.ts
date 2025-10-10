import { Injectable } from '@angular/core';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { AppUrl } from '@app/core/constants/app.url';
import { ResultVO } from '@rydeen/angular-framework';

@Injectable({ providedIn: 'root' })
export class ScreenService extends AbstractAppService {
  /**
   * 获取餐厅列表
   * @param pageNum 页码
   * @param pageSize 每页条数
   */
  getRestaurants(pageNum: number, pageSize: number): Promise<ResultVO<any>> {
    return this.request(
      AppUrl.RESTAURANT_PAGE,
      { pageNum, pageSize, total: 0 } // 请求参数
    );
  }
}
