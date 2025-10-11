import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { App, AppInfo } from '@capacitor/app';
import { v4 } from 'uuid';
import { environment } from '@/environments/environment';
import { UpdateService } from '@app/core/services/update.service';

export interface TwAppInfo extends AppInfo {
    assetsVersion: string;
}

@Injectable({
    providedIn: 'root',
})
export class AppInfoService {
    constructor(
        private translate: TranslateService,
        private updateService: UpdateService,
    ) {}

    /**
     * @desc 获取APP信息
     */
    async getAppInfo(): Promise<TwAppInfo> {
        let info;
        let assetsVersion;
        const localVersion = await this.updateService.getLocalVersion();
        console.info('[版本更新]localVersion = ', JSON.stringify(localVersion));
        if (localVersion?.assetsVersion) {
            assetsVersion = localVersion.assetsVersion;
        } else {
            assetsVersion = environment.assetsVersion;
        }
        console.info('[版本更新]assetsVersion = ', assetsVersion);
        try {
            info = await App.getInfo();
            (info as TwAppInfo).assetsVersion = assetsVersion;
        } catch (e) {
            info = {
                id: v4(),
                build: '',
                assetsVersion: assetsVersion,
                version: environment.appVersion,
                name: this.translate.instant('app.common.title'),
            };
        }
        return info as TwAppInfo;
    }
}
