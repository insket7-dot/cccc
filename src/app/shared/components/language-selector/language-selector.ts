import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, LanguageOption } from '../../../core/services/language.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-language-selector',
    standalone: true,
    imports: [CommonModule, MatSelectModule, MatFormFieldModule, TranslateModule],
    template: `
        <mat-form-field appearance="outline" class="language-selector">
            <mat-label>{{ 'app.language.select' | translate }}</mat-label>
            <mat-select
                [value]="currentLanguage"
                (selectionChange)="onLanguageChange($event.value)"
                class="language-select"
            >
                @for (language of availableLanguages; track language.code) {
                    <mat-option [value]="language.code">
                        {{ language.nativeName }}
                    </mat-option>
                }
            </mat-select>
        </mat-form-field>
    `,
    styles: [
        `
            .language-selector {
                margin-top: 40px;
                min-width: 120px;
                margin-left: 16px;
            }
            .language-select {
                font-size: 14px;
            }
        `,
    ],
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
    availableLanguages: LanguageOption[] = [];
    currentLanguage: string = 'zh-cn';

    private destroy$ = new Subject<void>();

    constructor(@Inject(LanguageService) private languageService: LanguageService) {}

    ngOnInit(): void {
        this.availableLanguages = this.languageService.getAvailableLanguages();

        this.languageService.currentLanguage$
            .pipe(takeUntil(this.destroy$))
            .subscribe((language: string) => {
                this.currentLanguage = language;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onLanguageChange(languageCode: string): void {
        this.languageService.setLanguage(languageCode);
    }
}
