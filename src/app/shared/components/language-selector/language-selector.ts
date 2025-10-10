import { Component, OnInit, OnDestroy, Inject, signal, computed, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService, LanguageOption } from '@app/core/services/language.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-language-selector',
    standalone: true,
    imports: [CommonModule, MatSelectModule, MatFormFieldModule, TranslateModule],
    template: `
        <!--        <mat-form-field appearance="outline" class="language-selector">-->
        <!--            <mat-label>{{ 'app.language.select' | translate }}</mat-label>-->
        <!--            <mat-select-->
        <!--                [value]="currentLanguage"-->
        <!--                (selectionChange)="onLanguageChange($event.value)"-->
        <!--                class="language-select"-->
        <!--            >-->
        <!--                @for (language of availableLanguages; track language.code) {-->
        <!--                    <mat-option [value]="language.code">-->
        <!--                        {{ language.nativeName }}-->
        <!--                    </mat-option>-->
        <!--                }-->
        <!--            </mat-select>-->
        <!--        </mat-form-field>-->
        <div class="language-switch">
            @for (item of availableLanguages; track item.code) {
                <div
                    class="switch-option"
                    [class.selected]="item.code === currentLanguage()"
                    (click)="onLanguageChange(item.code)"
                >
                    {{ item.shortName }}
                </div>
            }
            <div class="switch-btn" [style.left]="sliderLeft()"></div>
        </div>
    `,
    styles: [
        `
            .language-switch {
                display: flex;
                align-items: center;
                min-width: 110px;
                height: 30px;
                border-radius: 15px;
                background-color: #fff;
                border: 1px solid #faa31b;
                position: relative;
                padding: 0;
            }

            /* 每个选项平均分配宽度 */
            .switch-option {
                flex: 1;
                text-align: center;
                z-index: 1;
                color: #faa31b;
                font-size: 14px;
                min-width: 60px;
            }

            .switch-option.selected {
                color: #fff;
            }

            /* 滑块样式：宽度自动适应选项 */
            .switch-btn {
                height: 28px;
                border-radius: 14px;
                background-color: #faa31b;
                position: absolute;
                top: 1px;
                transition: left 0.3s ease; /* 平滑过渡动画 */
                /* 滑块宽度 = 容器宽度 / 选项数量 - 2px（减去边框间距） */
                width: calc(100% / var(--option-count) - 2px);
            }

            //.language-selector {
            //    margin-top: 40px;
            //    min-width: 120px;
            //    margin-left: 16px;
            //}
            //.language-select {
            //    font-size: 14px;
            //}
        `,
    ],
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
    availableLanguages: LanguageOption[] = [];
    currentLanguage = signal<string>('zh-cn');
    sliderLeft = computed(() => {
        const index = this.availableLanguages.findIndex(
            (item) => item.code === this.currentLanguage(),
        );
        const itemWidth = 100 / this.availableLanguages.length;
        return `calc(${index * itemWidth}% + 1px)`;
    });

    private destroy$ = new Subject<void>();

    constructor(
        @Inject(LanguageService) private languageService: LanguageService,
        private el: ElementRef,
    ) {}

    ngOnInit(): void {
        this.availableLanguages = this.languageService.getAvailableLanguages();

        // 给组件根元素设置 CSS 变量 --option-count
        this.el.nativeElement.style.setProperty(
            '--option-count',
            this.availableLanguages.length.toString(),
        );

        this.languageService.currentLanguage$
            .pipe(takeUntil(this.destroy$))
            .subscribe((language: string) => {
                this.currentLanguage.set(language);
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
