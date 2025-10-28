import { Injectable } from '@angular/core';
import { Voice } from '@capacitor-rydeen/voice';
import { LocalStorage } from '@rydeen/angular-framework';
import { CacheKey } from '@app/shared/constants/cache.key';
import { LanguageService } from '@app/core/services/language.service';

@Injectable({
    providedIn: 'root',
})
export class AppVoiceService {
    private defaultLocalLanguage = 'zh-cn';

    constructor(private languageService: LanguageService) {}

    async initialize() {
        Voice.loadInit().catch((error) => console.error(error));
    }

    async speak(text: string): Promise<void> {
        const lang: string = this.languageService.getCurrentLanguage();
        Voice.speak({ text, lang });
    }

    stop() {
        Voice.stop();
    }
}
