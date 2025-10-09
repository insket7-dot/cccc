import { Component, OnInit } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { LocalStorage, Headers } from '@rydeen/angular-framework';
import { SUPPORT_LANGUAGES } from '@app/shared/constants/app.languages';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-languages',
    imports: [MatButtonToggleModule, TranslateModule],
    templateUrl: './languages.html',
    styleUrl: './languages.scss',
})
export class LanguagesComponent extends AbstractAppPage implements OnInit {
    currentLanguage = 'zh-cn';
    languagesList = SUPPORT_LANGUAGES.filter((item) => item.available);
    constructor() {
        super();
    }

    async ngOnInit() {
        const local: string | null = await LocalStorage.getItem(Headers.X_RD_REQUEST_LANGUAGE);
        if (local) {
            this.currentLanguage = local;
            this.translate.use(local);
        }
    }

    onLanguagesChange(value: string): void {
        console.log(value);
        this.currentLanguage = value;
        this.translate.use(value);
        void LocalStorage.setItem(Headers.X_RD_REQUEST_LANGUAGE, value);
        // this.eventManager.publish(this.appEvent.EVENT_LANGUAGES, value);
    }
}
