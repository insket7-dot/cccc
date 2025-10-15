import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Inject,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AppEvent } from './core/constants/app.event';
import { Subscription } from 'rxjs';
import { BarcodeService } from './core/services/barcode.service';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { triggerAnimation } from './core/animations/route-animations';
import { AppUrl } from './core/constants/app.url';
import { AbstractAppPage } from './shared/abstracts/abstract.app.page';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { DATABASE_SERVICE } from './core/tokens/database.token';
import type { IDatabaseService } from './core/interfaces/database.interface';
// import {LanguageSelectorComponent} from './shared/components/language-selector/language-selector';
import { MigrationService } from './core/services/migration.service';
import { IdleTimeoutService } from '@/app/core/services/timeout.service';
import { AppStoreService } from '@/app/shared/services/app.store.service';


@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        MatToolbarModule,
        MatButtonModule,
        MatSnackBarModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        TranslateModule,
        // LanguageSelectorComponent,
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    animations: [triggerAnimation],
})
export class App extends AbstractAppPage implements OnDestroy, OnInit {
    protected readonly title = signal('cross-platform-app');
    protected readonly lastScan = signal<string | null>(null);
    protected readonly loading = signal<boolean>(false);
    public isWeb: boolean = false;
    private initPlugin: boolean = false;

    private readonly subscriptions: Subscription[] = [];

    constructor(
        private readonly contexts: ChildrenOutletContexts,
        private readonly barcodeService: BarcodeService,
        private platform: Platform,
        @Inject(IdleTimeoutService) private idleTimeoutService: IdleTimeoutService,
        @Inject(DATABASE_SERVICE) private readonly databaseService: IDatabaseService,
        private readonly migrationService: MigrationService,
        private appStoreService:AppStoreService
    ) {
        super();
        this.initializeApp();
        this.appStoreService.init();

        this.idleTimeoutService.startMonitoring();
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.eventManager.subscribe(AppEvent.SHOW_GLOBAL_LOADING, (show: boolean) =>
                this.loading.set(show),
            ),
        );
    }

    initializeApp() {
        console.log('App initialization started');
        this.platform
            .ready()
            .then(async () => {
                console.log('Platform ready');
                this.databaseService
                    .initializePlugin()
                    .then(async (ret) => {
                        this.initPlugin = ret;
                        console.log(`Database plugin initialized: ${ret}`);

                        if (this.databaseService.getPlatform() === 'web') {
                            this.isWeb = true;
                            console.log('Web platform detected, initializing jeep-sqlite...');

                            try {
                                // 等待 Stencil 完全准备好
                                console.log('Waiting for jeep-sqlite custom element definition...');
                                await customElements.whenDefined('jeep-sqlite');
                                console.log('jeep-sqlite custom element is defined');

                                // 检查 jeep-sqlite 元素是否存在
                                const jeepSqliteEl = document.querySelector('jeep-sqlite') as any;
                                if (!jeepSqliteEl) {
                                    throw new Error('jeep-sqlite element not found in DOM');
                                }
                                console.log('jeep-sqlite element found in DOM');

                                // 等待元素完全连接和初始化
                                await new Promise((resolve) => {
                                    const checkConnection = () => {
                                        if (jeepSqliteEl.isConnected) {
                                            console.log('jeep-sqlite element is connected');
                                            // 再等待一小段时间确保元素完全初始化
                                            setTimeout(() => {
                                                console.log(
                                                    'jeep-sqlite element initialization completed',
                                                );
                                                resolve(void 0);
                                            }, 200);
                                        } else {
                                            console.log(
                                                'Waiting for jeep-sqlite element connection...',
                                            );
                                            setTimeout(checkConnection, 50);
                                        }
                                    };
                                    checkConnection();
                                });

                                console.log(
                                    'jeep-sqlite element is ready, database already initialized in initializePlugin()',
                                );
                                console.log(`>>>> isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
                                console.log('Database initialization completed successfully');
                                await this.migrationService.run();
                            } catch (error) {
                                console.error('Database initialization failed:', error);
                                console.error('Error stack:', error);
                            }
                        } else {
                            console.log(
                                `Non-web platform detected: ${this.databaseService.getPlatform()}`,
                            );
                        }

                        console.log(`>>>> in App  this.initPlugin ${this.initPlugin}`);
                    })
                    .catch((error) => {
                        console.error('Database plugin initialization failed:', error);
                    });
            })
            .catch((error) => {
                console.error('Platform ready failed:', error);
            });
    }

    async onScanClicked(): Promise<void> {
        try {
            const value = await this.barcodeService.scanOnce();
            this.lastScan.set(value);
        } catch (err) {
            this.lastScan.set(null);
            // Avoid throwing to keep UI simple
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    getRouteAnimationData() {
        return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }

    protected readonly AppUrl = AppUrl;
    protected readonly Capacitor = Capacitor;
}
