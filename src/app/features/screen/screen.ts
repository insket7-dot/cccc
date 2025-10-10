import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';

import { TranslateModule } from '@ngx-translate/core';
import { ScreenService } from './services/screen.service';
import { ResultVO } from '@rydeen/angular-framework';

@Component({
    selector: 'app-screen',
    styleUrls: ['./screen.scss'],
    imports: [TranslateModule,CommonModule],
    template: `
        <div class="splash-container">
            <div class="logo-container">
                <div class="carousel">
                    <img
                        *ngFor="let img of images; let i = index"
                        [src]="img.src"
                        [alt]="img.alt"
                        class="yaki-logo"
                        [class.active]="i === currentIndex"
                    >
                </div>
            </div>
            <div class="tap-text" (click)="startOrder()" >{{'page.text1' | translate}}</div>
        </div>
    `,
})
export class Screen extends AbstractAppPage implements OnInit, OnDestroy {
    images = [
        { src: 'https://q8.itc.cn/q_70/images03/20250217/0e825f6d9e4b4a98a99eea84567fe6a3.jpeg', alt: 'yaki logo' },
        { src: 'https://img1.baidu.com/it/u=4061185545,3033224815&fm=253&fmt=auto&app=138&f=JPEG', alt: 'customer service logo' }
    ];

    currentIndex = 0;
    private carouselInterval: any;

    constructor(private screenService: ScreenService) {
        super();
    }

    ngOnInit() {
        this.startCarousel();
        //  this.fetchRestaurants();
    }

    ngOnDestroy() {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
    }
      private async fetchRestaurants() {
        try {
            const result: ResultVO<any> = await this.screenService.getRestaurants(1, 10);
            console.log('%c [ result ]-56', 'font-size:13px; background:#695e68; color:#ada2ac;', result);
            if (result.success && result.data) {
                console.log('餐厅数据:', result.data);
                // 处理返回的数据
            } else {
                console.error('获取餐厅数据失败:', result.msg);
                this.error(result.msg || '获取餐厅信息失败');
            }
        } catch (error) {
            console.error('接口调用出错:', error);
            this.error('网络请求异常，请稍后重试');
        }
    }

    private startCarousel() {
        this.carouselInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        }, 5000);
    }

    async startOrder() {
        this.router.navigate(['/home']);

           // await this.confirm(
        //     'menu.deleteConfirm',
        //     { name: '可乐' },
        //     async (result): Promise<boolean> => {
        //         if (result.role === 'ok') {
        //             await this.success('删除成功');
        //             return true;
        //         } else {
        //             await this.info('已取消删除');
        //             return false;
        //         }
        //     }
        // );
    }
}
