import { Component, OnInit, OnDestroy, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { AppStoreService } from '@/app/shared/services/app.store.service';
import { MqttService } from '@app/core/services/mqtt.service';
import { CarouselImage } from '@app/shared/types/store.shared.types';
import { PrintOrderService } from '@app/shared/services/plugin/print-order.service';
import { AppVoiceService } from '@app/shared/services/plugin/app.voice.service';
import { AppMenuService } from '@app/shared/services/app.menu.service';
import { AppUrlService } from '@app/shared/services/util/app.url.service';
import { SerialNumberService } from '@app/shared/services/order/serial-number.service';
import { ClearService } from '@app/shared/services/ui/clear.service';

@Component({
    selector: 'app-screen',
    styleUrls: ['./screen.scss'],
    imports: [TranslateModule, CommonModule],
    template: `
        <div class="splash-container">
            <div class="logo-container">
                <div class="carousel">
                    @for (img of images(); track $index) {
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
    images = computed<CarouselImage[]>(() => this.appStoreService.carouselImagesValue() || []);

    currentIndex = 0;
    private carouselInterval: any;

    constructor(
        private menuService: AppMenuService,
        private printOrderService: PrintOrderService,
        private appStoreService: AppStoreService,
        private mqttService: MqttService,
        private voiceService: AppVoiceService,
        private readonly appUrlService: AppUrlService,
        private serialNumberService: SerialNumberService,
        private clearService: ClearService,
    ) {
        super();
        void this.printOrderService; // 确保依赖注入
        void this.serialNumberService; // 确保流水号依赖注入
        effect(() => {
            if (this.images().length > 0) {
                this.startCarousel();
            }
        });
    }

    ngOnInit() {
        Promise.allSettled([
            this.menuService.init(),
            this.appStoreService.init(),
            this.mqttService.initialize(),
            this.printOrderService.initialize(),
            this.voiceService.initialize(),
        ]).catch((error) => console.error('初始化失败', error));

        this.clearService.clearAll();
    }

    ngOnDestroy() {
        this.stopCarousel();
    }

    private stopCarousel() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
            this.currentIndex = 0;
        }
    }

    private startCarousel() {
        this.stopCarousel();
        this.carouselInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.images().length;
        }, 5000);
    }

    async startOrder() {
        this.router
            .navigate([this.appUrlService.getPageUrlValue('PAGE_HOME')])
            .catch((error) => console.error('导航失败', error));
    }
}
