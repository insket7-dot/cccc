import { EventNameEnum } from '@rydeen/angular-framework';

/** 全局应用事件 */
export class AppEvent extends EventNameEnum {
  /** 控制全局加载遮罩显隐 */
  static SHOW_GLOBAL_LOADING = new AppEvent('SHOW_GLOBAL_LOADING', 'app.showGlobalLoading');

  private constructor(name: string, value: string) {
    super(name, value);
  }
}


