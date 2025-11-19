import { Injectable } from '@angular/core';
import { Voice } from '@capacitor-rydeen/voice';
import { LanguageService } from '@app/core/services/language.service';
import { AppStoreService } from '@app/shared/services/data/app.store.service';

@Injectable({
    providedIn: 'root',
})
export class AppVoiceService {
    constructor(
        private languageService: LanguageService,
        private storeInfo: AppStoreService,
    ) {}

    async initialize() {
        Voice.loadInit().catch((error) => console.error(error));
    }

    /**
     * @desc 播放语音
     */
    async speak(text: string): Promise<void> {
        const storeInfo = this.storeInfo.storeBaseInfoValue();
        if (storeInfo?.voiceFlag) {
            const lang: string = this.languageService.getCurrentLanguage();
            Voice.speak({ text, lang });
        }
    }

    /**
     * @desc 停止播放
     */
    stop() {
        Voice.stop();
    }
}
