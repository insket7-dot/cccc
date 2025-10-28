import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { AppStoreService } from '@/app/shared/services/app.store.service';
import { MqttService } from '@app/core/services/mqtt.service';
import { CarouselImage } from '@app/shared/types/store.shared.types';
import { PrintOrderService } from '@app/shared/services/print-order.service';
import { AppVoiceService } from '@app/shared/services/app.voice.service';

@Component({
    selector: 'app-screen',
    styleUrls: ['./screen.scss'],
    imports: [TranslateModule, CommonModule],
    template: `
        <div class="splash-container">
            <div class="logo-container">
                <div class="carousel">
                    @for (img of images; track $index) {
                        <img
                            [src]="img.image"
                            [alt]="'image'"
                            class="yaki-logo"
                            [class.active]="$index === currentIndex"
                        />
                    }
                </div>
            </div>
            <div class="tap-text" (click)="startOrder()">{{ 'page.text1' | translate }}</div>
        </div>
    `,
})
export class Screen extends AbstractAppPage implements OnInit, OnDestroy {
    images: CarouselImage[] = [];

    currentIndex = 0;
    private carouselInterval: any;

    constructor(
        private printOrderService: PrintOrderService,
        private appStoreService: AppStoreService,
        private mqttService: MqttService,
        private voiceService: AppVoiceService,
    ) {
        super();
        void this.printOrderService; // 确保依赖注入
        effect(() => {
            const images = this.appStoreService.carouselImagesValue();
            if (images && images.length > 0) {
                this.images = images;
                this.startCarousel();
            }
        });
    }

    ngOnInit() {
        Promise.allSettled([
            this.appStoreService.init(),
            this.mqttService.initialize(),
            this.printOrderService.initialize(),
            this.voiceService.initialize(),
        ]).catch((error) => console.error('初始化失败', error));
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
        this.router.navigate(['/home']).catch((error) => console.error('导航失败', error));
    }
}
