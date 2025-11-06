import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractLayoutPage } from '@app/shared/abstracts/abstract.layout.page';
import { HomeService } from './services/home.service';
import { MenuData } from '@app/shared/types/menu.shared.types';
import { AppUrlService } from '@app/shared/services/app.url.service';

@Component({
    selector: 'app-home-with-layout',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatChipsModule,
        MatCardModule,
        TranslateModule,
    ],
    template: `
        <div class="home-container">
            <div class="home-header">
                <h1>{{ 'app.home.title' | translate }}</h1>
                <p>{{ 'app.home.subtitle' | translate }}</p>
            </div>

            <div class="home-actions">
                <button
                    mat-flat-button
                    color="primary"
                    (click)="onMenuProcess()"
                    [disabled]="loading()"
                >
                    {{ 'app.home.actions.syncMenu' | translate }}
                </button>
            </div>

            <div class="home-content">
                <mat-form-field appearance="outline" class="search-field">
                    <mat-label>{{ 'app.home.search.placeholder' | translate }}</mat-label>
                    <input
                        matInput
                        [(ngModel)]="searchQuery"
                        (keyup.enter)="onMenuSearch()"
                        placeholder="{{ 'app.home.search.placeholder' | translate }}"
                    />
                </mat-form-field>

                <button
                    mat-flat-button
                    color="accent"
                    (click)="onMenuSearch()"
                    class="search-button"
                >
                    {{ 'app.home.actions.search' | translate }}
                </button>
            </div>

            @if (searchItems().length > 0) {
                <div class="search-results">
                    <h3>{{ 'app.home.search.results' | translate }}</h3>
                    <div class="menu-grid">
                        @for (item of searchItems(); track item.id) {
                            <mat-card class="menu-card">
                                <mat-card-header>
                                    <mat-card-title>{{ item.name }}</mat-card-title>
                                    <mat-card-subtitle>{{ item.category }}</mat-card-subtitle>
                                </mat-card-header>
                                <mat-card-content>
                                    <p class="price">¥{{ item.price }}</p>
                                    @if (item.tags && item.tags.length > 0) {
                                        <mat-chip-set>
                                            @for (tag of item.tags; track tag) {
                                                <mat-chip>{{ tag }}</mat-chip>
                                            }
                                        </mat-chip-set>
                                    }
                                </mat-card-content>
                            </mat-card>
                        }
                    </div>
                </div>
            }

            @if (processLog()) {
                <div class="process-log">
                    <p>{{ processLog() }}</p>
                </div>
            }
        </div>
    `,
    styles: [
        `
            .home-container {
                padding: 20px;
            }

            .home-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .home-actions {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }

            .home-content {
                display: flex;
                gap: 16px;
                align-items: center;
                margin-bottom: 20px;
            }

            .search-field {
                flex: 1;
                max-width: 400px;
            }

            .search-button {
                height: 56px;
            }

            .menu-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
                margin-top: 16px;
            }

            .menu-card {
                height: 200px;
            }

            .price {
                font-size: 18px;
                font-weight: bold;
                color: var(--mat-app-primary);
            }

            .process-log {
                margin-top: 20px;
                padding: 16px;
                background-color: var(--mat-app-surface);
                border-radius: 8px;
            }
        `,
    ],
})
export class HomeWithLayoutComponent extends AbstractLayoutPage implements OnInit {
    protected searchQuery = signal<string>('');
    protected readonly processLog = signal<string | null>(null);
    protected readonly searchItems = signal<MenuData[]>([]);

    constructor(
        private readonly homeService: HomeService,
        private readonly appUrlService: AppUrlService,
    ) {
        super();
    }

    ngOnInit(): void {
        // 设置当前页面为活跃状态
        this.setActiveNavigation(this.appUrlService.getPageUrl('PAGE_HOME'));

        // 可以在这里定制布局配置
        this.updateLayoutConfig({
            toolbarTitle: '首页 - 菜单管理',
            showSidenav: false, // 首页不需要侧边栏
        });
    }

    async onMenuProcess(): Promise<void> {
        try {
            this.loading.set(true);
            this.processLog.set(this.translate.instant('app.home.messages.syncing'));
            const menuModels = await this.homeService.syncAndCacheMenus();
            if (!menuModels.success) {
                await this.error(menuModels.msg);
                return;
            }
            const count = menuModels.data.length;
            const successMsg = this.translate.instant('app.home.messages.syncSuccess', { count });
            this.processLog.set(successMsg);
            await this.success(successMsg);
        } catch (e: any) {
            const errorMsg = this.translate.instant('app.home.messages.syncFailed', {
                error: e.message,
            });
            this.processLog.set(errorMsg);
            await this.error(e.message);
        } finally {
            this.loading.set(false);
        }
    }

    async onMenuSearch(): Promise<void> {
        try {
            const keyword = (this.searchQuery() || '').trim();
            const items = await this.homeService.searchMenus(keyword);
            this.searchItems.set(items);
            const searchMsg = this.translate.instant('app.home.messages.searchComplete', {
                keyword: keyword || this.translate.instant('app.common.noData'),
                count: items.length,
            });
            this.processLog.set(searchMsg);
        } catch (e: any) {
            const errorMsg = this.translate.instant('app.home.messages.searchFailed', {
                error: e.message,
            });
            this.processLog.set(errorMsg);
            await this.error(e.message);
        }
    }

    protected override onScanResult(value: string): void {
        // 在首页处理扫码结果，比如搜索商品
        this.searchQuery.set(value);
        this.onMenuSearch();
    }
}
