import {
    Component,
    OnInit,
    OnDestroy,
    Inject,
    Input,
    HostListener,
    ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, LanguageOption } from '../../../core/services/language.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-language-selector',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="custom-language-selector" [style.width]="width || '120px'">
            <!-- 下拉按钮：包含地球图标和当前语言 -->
            <div
                class="dropdown-button"
                [ngClass]="{ expanded: isDropdownOpen }"
                (click)="toggleDropdown($event)"
            >
                <span class="globe-icon">🌐</span>
                <span class="current-language">{{ currentLanguageNativeName }}</span>
                <span class="arrow-icon"
                    >@if (isDropdownOpen) {
                    <img src="/assets/image/icon_up1.png" />
                    } @else {
                    <img src="/assets/image/icon_down.png" />
                    }
                </span>
            </div>

            <!-- 下拉选项列表 -->
            <div class="dropdown-options" *ngIf="isDropdownOpen">
                @for (language of availableLanguages; track language.code) {
                <div
                    class="dropdown-option"
                    [class.active]="language.code === currentLanguage"
                    (click)="selectLanguage(language.code)"
                >
                    {{ language.nativeName }}
                </div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .custom-language-selector {
                position: relative;
                font-family: Arial, sans-serif;
            }

            /* 下拉按钮样式 - 带圆角 */
            .dropdown-button {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6px 0px;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 8px; /* 圆角效果 */
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }

            /* 展开状态的按钮样式 */
            .dropdown-button.expanded {
                border-bottom-left-radius: 0; /* 展开时底部左圆角取消 */
                border-bottom-right-radius: 0; /* 展开时底部右圆角取消 */
                border-color: #ccc;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .globe-icon {
                margin-right: 8px;
                font-size: 16px;
            }

            .current-language {
                flex: 1;
                text-align: left;
                font-size: 14px;
                color:#F48610;
                 width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
            }

            .arrow-icon {
                margin-left: 8px;
                font-size: 12px;
                transition: transform 0.2s ease;
                padding-right:4px;

                img {
                    width: 12px;
                    height: 6px;
                }
            }

            /* 下拉选项列表 - 带圆角 */
            .dropdown-options {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-top: none;
                border-bottom-left-radius: 8px; /* 底部左圆角 */
                border-bottom-right-radius: 8px; /* 底部右圆角 */
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 100;
                max-height: 200px;
                overflow-y: auto;
            }

            /* 选项样式 */
            .dropdown-option {
                padding: 10px 12px;
                cursor: pointer;
                text-align: left;
                font-size: 14px;
                transition: background-color 0.2s ease;
            }

            .dropdown-option:hover,
            .dropdown-option.active {
                background-color: #f5f5f5;
            }

            /* 滚动条样式优化 */
            .dropdown-options::-webkit-scrollbar {
                width: 6px;
            }

            .dropdown-options::-webkit-scrollbar-thumb {
                background-color: #ddd;
                border-radius: 3px;
            }
        `,
    ],
})
export class LanguageSelectorComponent implements OnInit, OnDestroy {
    availableLanguages: LanguageOption[] = [];
    currentLanguage: string = 'zh-cn';
    currentLanguageNativeName: string = '中文';
    isDropdownOpen: boolean = false;

    private destroy$ = new Subject<void>();

    @Input() width?: string;
    @Input() height?: string;

    constructor(
        @Inject(LanguageService) private languageService: LanguageService,
        private elementRef: ElementRef
    ) {}

    ngOnInit(): void {
        this.availableLanguages = this.languageService.getAvailableLanguages();

        this.languageService.currentLanguage$
            .pipe(takeUntil(this.destroy$))
            .subscribe((languageCode: string) => {
                this.currentLanguage = languageCode;
                const lang = this.availableLanguages.find((l) => l.code === languageCode);
                this.currentLanguageNativeName = lang ? lang.nativeName : 'Unknown';
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // 切换下拉展开/收起
    toggleDropdown(event: Event) {
        event.stopPropagation(); // 防止事件冒泡
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    // 选择语言
    selectLanguage(languageCode: string) {
        this.languageService.setLanguage(languageCode);
        this.isDropdownOpen = false;
    }

    // 点击外部区域关闭下拉
    @HostListener('document:click')
    onDocumentClick() {
        this.isDropdownOpen = false;
    }
}
