import {Component, OnDestroy, signal} from '@angular/core';
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

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule],
    templateUrl: './app.html',
    styleUrl: './app.scss',
    animations: [triggerAnimation]
})
export class App extends AbstractPage implements OnDestroy {
    protected readonly title = signal('cross-platform-app');
    protected readonly lastScan = signal<string | null>(null);
    protected readonly loading = signal<boolean>(false);

    private readonly subscriptions: Subscription[] = [];

    constructor(
        private contexts: ChildrenOutletContexts,
        private readonly barcodeService: BarcodeService) {
        super();
        this.subscriptions.push(
            this.eventManager.subscribe(AppEvent.SHOW_GLOBAL_LOADING, (show: boolean) => this.loading.set(show))
        );
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
