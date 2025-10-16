import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';

import { TranslateModule } from '@ngx-translate/core';
import { ScreenService } from './services/screen.service';
import { ResultVO } from '@rydeen/angular-framework';
import { DateUtils } from '@app/shared/utils/date-utils';
import { AppStoreService } from '@/app/shared/services/app.store.service';

@Component({
    selector: 'app-screen',
    styleUrls: ['./screen.scss'],
    imports: [TranslateModule, CommonModule],
    template: `
        <div class="splash-container">
            <div class="logo-container">
                <div class="carousel">
                    <img
                        *ngFor="let img of images; let i = index"
                        [src]="img.image"
                        [alt]="'image'"
                        class="yaki-logo"
                        [class.active]="i === currentIndex"
                    />
                </div>
            </div>
            <div class="tap-text" (click)="startOrder()">{{ 'page.text1' | translate }}</div>
        </div>
    `,
})
export class Screen extends AbstractAppPage implements OnInit, OnDestroy {
    images: Array<{ image: string; alt: string; index: number }> = [];

    currentIndex = 0;
    private carouselInterval: any;

    constructor(
        private screenService: ScreenService,
        private dateUtils: DateUtils,
        private appStoreService: AppStoreService
    ) {
        super();
        this.appStoreService.init();

        effect(() => {
            const images = this.appStoreService.carouselImagesValue();
            if (images && images.length > 0) {
                this.images = images;
                this.startCarousel();
            }
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
    }

    private startCarousel() {
        this.carouselInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        }, 5000);
    }

    async startOrder() {
        this.router.navigate(['/home']);
    }
}
