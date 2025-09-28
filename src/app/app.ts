import {Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AppEvent} from './core/constants/app.event';
import {Subscription} from 'rxjs';
import {BarcodeService} from './core/services/barcode.service';
import {ChildrenOutletContexts, RouterOutlet} from '@angular/router';
import {triggerAnimation} from './core/animations/route-animations';
import {AppUrl} from "./core/constants/app.url";
import {AbstractPage} from "./shared/abstracts/abstractPage";
import {Platform} from "@ionic/angular";
import {Capacitor} from "@capacitor/core";
import {DATABASE_SERVICE} from "./core/tokens/database.token";
import type {IDatabaseService} from "./core/interfaces/database.interface";

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule],
    templateUrl: './app.html',
    styleUrl: './app.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    animations: [triggerAnimation]
})
export class App extends AbstractPage implements OnDestroy {
    public isWeb: boolean = Capacitor.getPlatform() === 'web';
    protected readonly title = signal('cross-platform-app');
    protected readonly lastScan = signal<string | null>(null);
    protected readonly loading = signal<boolean>(false);

    private readonly subscriptions: Subscription[] = [];

    constructor(private readonly contexts: ChildrenOutletContexts,
                private readonly barcodeService: BarcodeService,
                private readonly platform: Platform,
                @Inject(DATABASE_SERVICE) private readonly databaseService: IDatabaseService) {
        super();
        this.subscriptions.push(
            this.eventManager.subscribe(AppEvent.SHOW_GLOBAL_LOADING, (show: boolean) => this.loading.set(show))
        );
        this.initializeApp();
    }

    initializeApp(): void {
        this.platform.ready().then(() => {
            this.databaseService.initialize().catch((error: Error) => {throw error});
        })
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
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    getRouteAnimationData() {
        return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
    }

    protected readonly AppUrl = AppUrl;
}
