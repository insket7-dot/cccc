import { Injectable } from '@angular/core';
import {
    BundleInfo,
    BundleStatus,
    HotfixManage,
    HotfixOptions,
    PatchInfo,
    VersionMetadata,
} from '@rydeen/hotfix';
import { environment } from '@/environments/environment';
import { ToastDuration, Tools } from '@capacitor-rydeen/tools';
import { Capacitor } from '@capacitor/core';
import { EventManager, LocalStorage } from '@rydeen/angular-framework';
import { AppEvent } from '@app/core/constants/app.event';
import { CacheKey } from '@app/shared/constants/cache.key';
import { LogService } from '@app/core/services/log.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class UpdateService {
    private hotfix: HotfixManage | undefined;

    constructor(
        private logger: LogService,
        private eventManager: EventManager,
        private translate: TranslateService,
    ) {}

    async initial() {
        this.hotfix = new HotfixManage(<HotfixOptions>{
            enable: true,
            checkDomain: environment.checkPatchUrl,
            statisticsDomain: environment.versionReportUrl,
            updateMode: 'dynamic',
            originVersion: {
                assetsVersion: environment.assetsVersion,
            },
            download: this.downloadProcessEvent.bind(this),
            downloadFailed: this.downloadFailedEvent.bind(this),
            updateAvailable: this.updateAvailableEvent.bind(this),
            updateFailed: this.updateFailedEvent.bind(this),
            appReloaded: this.appReloadedEvent.bind(this),
            appReady: this.appReadyEvent.bind(this),
        });
        await this.registerEvents();
    }

    async getLocalVersion() {
        return this.hotfix?.getLocalVersion();
    }

    async registerEvents() {
        await this.hotfix?.registerEvents();
    }

    /**
     * 下载进度事件（当开始下载更新包的时候触发的事件，通常用于显示更新进度）
     * @param percent 下载进度百分比
     * @param bundle 资源包信息
     * @private
     */
    private downloadProcessEvent(percent: number, bundle: BundleInfo) {
        this.eventManager.publish(AppEvent.EVENT_DOWNLOAD_PROGRESS, percent);
    }

    /**
     * 下载失败事件（当更新包下载失败的时候触发的事件）
     * @param version 下载失败的版本
     * @private
     */
    private downloadFailedEvent(version: string) {}

    /**
     * 更新可用事件（当有新的资源包可用时触发的事件，此事件通常在App启动的时候自动静默检测到有更新的时候使用）
     * @param bundle 可用更新的资源包信息
     * @private
     */
    private updateAvailableEvent(bundle: BundleInfo) {}

    /**
     * 更新失败事件（当更新失败时触发的事件）
     * @param bundle 更新失败的资源包信息
     * @private
     */
    private updateFailedEvent(bundle: BundleInfo) {}

    /**
     * 应用重载事件（在应用开始重载热修复补丁包时触发，通常用于提示或保存当前正在进行的业务或数据，防止数据丢失）
     * @private
     */
    private appReloadedEvent() {}

    /**
     * 应用准备就绪事件（在重载资源包成功后触发的事件，通常用于提示弹窗更新成功）
     * @param status 更新状态
     * @param bundle 更新的资源包信息
     * @private
     */
    private appReadyEvent(status: string, bundle: BundleInfo) {}

    /**
     * 上报统计信息
     */
    async reportStatisticInfo() {
        console.log('[版本升级]', `版本统计上报`);
        const timestamp = await LocalStorage.getItem<number>(CacheKey.LAST_STATISTICS_TIME);
        // 如果timestamp有效，并且时差未超过24小时则终止执行
        if (timestamp != null && new Date().getTime() - timestamp < 24 * 60 * 60 * 1000) {
            return;
        }
        const deviceId = await LocalStorage.getItem<string>(CacheKey.DEVICE_ID);
        if (deviceId == null) {
            this.logger.error('设备ID为空，无法上报设备信息。');
            return;
        }
        console.log('[版本升级]', `设备ID：${deviceId}`);
        const ver = await Tools.getClientVersionInfo();
        ver.webviewVersion = !ver.webviewVersion ? '' : ver.webviewVersion;
        await this.hotfix!.report(deviceId, ver.osVersion, ver.webviewVersion);
        await LocalStorage.setItem(CacheKey.LAST_STATISTICS_TIME, new Date().getTime());
        console.log('[版本升级]', `版本统计上报完成`);
    }

    /**
     * 静默检查更新
     */
    async silentlyCheckForUpdates(): Promise<void> {
        const versionMetadata = await this.hotfix!.checkVersion(true);
        if (!versionMetadata.hasAssetsUpdate) {
            console.info('[版本升级]', '没有新的资源包版本。');
        }
        console.info('[版本升级]', `检查到新版本，开始下载…… (${JSON.stringify(versionMetadata)})`);
        const patchInfo = await this.download(versionMetadata);
        console.info('[版本升级]', `下载完成，开始升级…… (${JSON.stringify(patchInfo)})`);
        await this.apply(patchInfo);
        console.info('[版本升级]', '升级完成。');
    }

    async checkForUpdates() {
        await this.registerEvents();
        let versionMetadata;
        try {
            if (Capacitor.getPlatform() === 'web') {
                versionMetadata = {
                    hasAssetsUpdate: true,
                    hasAppUpdate: true,
                    assetsVersion: '20240619',
                    newVersion: '3.0.1',
                    sign: '9zeHgtYnVjaHR0cHM6LyVlbi5jb20ua2V0LnJ5ZGBhdGNoL3BhY24vc3h4L34wXzI0MDYxdGNoXzMuMCMC56aXA=',
                } as VersionMetadata;
            } else {
                versionMetadata = await this.checkVersion();
            }
            await this.reportStatisticInfo();
            if (!versionMetadata.hasAssetsUpdate) {
                await Tools.toast({
                    message: this.translate.instant('app.settings.check.update.newest'),
                    duration: ToastDuration.LENGTH_LONG,
                });
                return;
            }
        } catch (e) {
            console.error('[版本升级]', e);
            await Tools.toast({
                message: this.translate.instant('app.settings.check.update.invalid'),
                duration: ToastDuration.LENGTH_LONG,
            });
            return;
        }
        // await this.toastService.confirm(
        //     'app.settings.check.update.assets.latest',
        //     { value: versionMetadata.assetsVersion },
        //     async (handler) => {
        //         console.log(handler);
        //         if (handler.role === 'ok') {
        //             this.downloadPatch(versionMetadata).catch((e) => this.logger.error(e));
        //             return true;
        //         } else if (handler.role === 'cancel') {
        //             return false;
        //         }
        //         return false;
        //     },
        // );
    }

    /**
     * 下载补丁并安装的函数
     * @param versionMetadata 版本数据
     * @returns {Promise<void>}
     * @private
     */
    private async downloadPatch(
        versionMetadata: VersionMetadata,
    ): Promise<{ success: boolean; data: PatchInfo | null; message?: string }> {
        try {
            console.info(`[版本升级]开始下载补丁：${JSON.stringify(versionMetadata)}`);
            const patchInfo = await this.download(versionMetadata);
            console.info(`[版本升级]下载补丁成功：${JSON.stringify(patchInfo)}`);
            if (patchInfo.status === BundleStatus.ERROR) {
                // await this.toastService.error(patchInfo.message!);
                // return patchInfo.message!;
                return { success: false, data: patchInfo };
            }

            return { success: true, data: patchInfo };
            // await this.toastService.confirm(
            //     'app.settings.check.update.download.success',
            //     {},
            //     async (handler) => {
            //         if (handler.role === 'ok') {
            //             await this.apply(patchInfo);
            //             return true;
            //         } else if (handler.role === 'cancel') {
            //             await this.apply(patchInfo, false);
            //             return false;
            //         }
            //         return false;
            //     },
            // );
        } catch (e: any) {
            console.error(e);
            return { success: false, message: e.message, data: null };
        }
    }

    /**
     * 手工检查更新
     * @returns {VersionMetadata} 返回版本元数据
     */
    private async checkVersion(): Promise<VersionMetadata> {
        return await this.hotfix!.checkVersion(false);
    }

    /**
     * 执行补丁下载
     * @param versionMetadata 版本元数据
     * @returns {PatchInfo} 返回补丁信息数据
     */
    private async download(versionMetadata: VersionMetadata): Promise<PatchInfo> {
        return await this.hotfix!.download(versionMetadata);
    }

    /**
     * 执行补丁升级
     * @param patchInfo 补丁信息
     * @param immediately 是否立即升级(true：立即升级[默认]，false：推迟到下次启动应用)
     * @returns {Promise<void>}
     */
    private async apply(patchInfo: PatchInfo, immediately: boolean = true): Promise<void> {
        await this.hotfix!.upgrade(patchInfo, immediately);
    }
}
