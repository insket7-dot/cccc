import { Component, inject, OnDestroy, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { MenuConstantsItem } from '@app/shared/types/menu.shared.types';
import { LanguageSelectorComponent } from '@app/shared/components/language-selector/language-selector';
import { ModelStateService } from '@app/shared/services/model-state.service';
import { modeList, wayList } from '@app/shared/constants/menu.constants';
import { AppUrlService } from '@app/shared/services/app.url.service';
import { DeviceStateEnum } from '@app/shared/constants/login.constants';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-home',
    imports: [TranslateModule, LanguageSelectorComponent, NgOptimizedImage],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export class Home extends AbstractAppPage implements OnDestroy {
    private readonly modelStateService = inject(ModelStateService);
    // 点餐模式
    wayList = computed(() => wayList);
    // 普通、儿童模式
    modelList = computed(() => modeList);

    curModel = computed(() => this.modelStateService.curModelValue());
    curWay = computed(() => this.modelStateService.curWayValue());

    private clickCount = 0; // 点击次数

    constructor(private readonly appUrlService: AppUrlService) {
        super();
    }

    ngOnDestroy() {
        this.clickCount = 0;
    }

    toggleWay(way: MenuConstantsItem) {
        this.modelStateService.setCurWay(way.type);
    }

    toggleModel(model: MenuConstantsItem) {
        this.modelStateService.setCurModel(model.type);
    }

    startOrder() {
        if (this.curWay() === '') {
            this.error(this.translate.instant('page.selectWay')).catch((error) =>
                console.error(error),
            );
            return;
        } else {
            this.router
                .navigate([this.appUrlService.getPageUrlValue('PAGE_MENU')])
                .catch((error) => console.error(error));
        }
    }

    onLogoClick() {
        this.clickCount++;
        // 点击6次后重置计数并导航到登录页
        if (this.clickCount >= 6) {
            this.clickCount = 0;
            this.router
                .navigate([this.appUrlService.getPageUrlValue('PAGE_LOGIN')], {
                    queryParams: { state: DeviceStateEnum.RESET },
                })
                .catch((error) => console.error(error));
        }
    }
}
