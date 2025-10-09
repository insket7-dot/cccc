import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppLayoutComponent, LayoutConfig, NavigationItem} from '../components/app-layout/app-layout';
import {AbstractAppPage} from './abstract.app.page';
import {AppUrl} from '../../core/constants/app.url';
import {BarcodeService} from '../../core/services/barcode.service';
import {Url} from "@rydeen/angular-framework";

/**
 * 抽象布局页（此为示例代码，非框架代码，抽象布局页请根据实际情况自行重写）
 *
 * @author richie696
 * @version 1.0
 * @since 2025/10/05
 */
@Component({
    selector: 'app-layout-page',
    standalone: true,
    imports: [CommonModule, AppLayoutComponent],
    template: `
        <app-layout
            [config]="layoutConfig()"
            [loading]="loading()"
            [sidenavOpen]="sidenavOpen()"
            (navigationClick)="onNavigationClick($event)"
            (scanClick)="onScanClick()"
            (sidenavToggle)="onSidenavToggle()">
            <ng-content></ng-content>
        </app-layout>
    `
})
export abstract class AbstractLayoutPage extends AbstractAppPage {
    protected readonly loading = signal<boolean>(false);
    protected readonly sidenavOpen = signal<boolean>(false);
    protected readonly layoutConfig = signal<LayoutConfig>(this.getDefaultLayoutConfig());

    protected barcodeService = inject(BarcodeService);

    protected constructor() {
        super();
    }

    /**
     * 获取默认布局配置
     * 子类可以重写此方法来定制布局
     */
    protected getDefaultLayoutConfig(): LayoutConfig {
        return {
            showToolbar: true,
            showSidenav: false,
            showLanguageSelector: true,
            showScanButton: true,
            toolbarTitle: 'cross-platform-app',
            navigationItems: this.getNavigationItems()
        };
    }

    /**
     * 获取导航项
     * 子类可以重写此方法来定制导航
     */
    protected getNavigationItems(): NavigationItem[] {
        return [
            {label: 'app.navigation.home', route: AppUrl.PAGE_HOME, icon: 'home'},
            {label: 'app.navigation.menu', route: AppUrl.PAGE_MENU, icon: 'restaurant_menu'},
            {label: 'app.navigation.users', route: AppUrl.PAGE_USERS, icon: 'people'}
        ];
    }

    /**
     * 更新布局配置
     */
    protected updateLayoutConfig(config: Partial<LayoutConfig>): void {
        this.layoutConfig.update(current => ({...current, ...config}));
    }

    /**
     * 设置当前活跃的导航项
     */
    protected setActiveNavigation(url: Url): void {
        this.layoutConfig.update(config => ({
            ...config,
            navigationItems: config.navigationItems?.map(item => ({
                ...item,
                active: item.route.value() === url.value()
            }))
        }));
    }

    /**
     * 导航点击处理
     */
    onNavigationClick(url: Url): void {
        this.navigateByUrl(url);
        this.setActiveNavigation(url);
    }

    /**
     * 扫码点击处理
     */
    async onScanClick(): Promise<void> {
        try {
            const value = await this.barcodeService.scanOnce();
            if (value) {
                await this.success(`扫码成功: ${value}`);
                this.onScanResult(value);
            }
        } catch (err) {
            await this.error('扫码失败');
        }
    }

    /**
     * 侧边栏切换
     */
    onSidenavToggle(): void {
        this.sidenavOpen.update(open => !open);
    }

    /**
     * 扫码结果处理
     * 子类可以重写此方法来处理扫码结果
     */
    protected onScanResult(value: string): void {
        // 默认实现，子类可以重写
    }
}
