import { Component, Inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationStart } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppUrlService } from '@app/shared/services/app.url.service';
import { CartService } from '@app/shared/services/cart.service';
import { TipTypeEnums } from '@app/shared/constants/app.enums';

@Component({
    selector: 'app-add-tips',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatInputModule, FormsModule, TranslateModule],
    templateUrl: './add-tips.component.html',
    styleUrls: ['./add-tips.component.scss'],
})
export class AddTipsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    tipTypeList = [
        { name: 'page.percentage', value: TipTypeEnums.PERCENT },
        { name: 'page.fixed', value: TipTypeEnums.FIXED },
    ];
    tipType = signal<TipTypeEnums>(TipTypeEnums.PERCENT);

    private tipModes = {
        [TipTypeEnums.PERCENT]: {
            suffix: '%',
            storage: signal<number | null>(null), // 该模式下的实际值
            quickSelect: [30, 50, 80], // 可选百分比
        },
        [TipTypeEnums.FIXED]: {
            suffix: '$',
            storage: signal<number | null>(null), // 该模式下的实际值
            quickSelect: [], // 可选固定金额
        },
    };
    inputValue = signal<number | null>(null);

    currentMode = computed(() => this.tipModes[this.tipType()]);

    constructor(
        private bottomSheetRef: MatBottomSheetRef<AddTipsComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private router: Router,
        private appUrlService: AppUrlService,
        private cartService: CartService,
    ) {
        // 监听当前模式变化，同步更新输入框值
        effect(() => {
            const mode = this.currentMode();
            this.inputValue.set(mode.storage());
            this.cartService.setTip(mode.storage() ?? 0, this.tipType());
        });

        // 监听输入框值变化，同步更新购物车小费
        effect(() => {
            const val = this.inputValue();
            const mode = this.currentMode();

            // 写入本模式缓存
            mode.storage.set(val);

            // 推进给 service
            if (val !== null && val >= 0) {
                this.cartService.setTip(val, this.tipType());
            }
        });
    }

    /**
     * @desc 小费总价展示
     */
    totalTip = computed(() => {
        return this.cartService.tip();
    });

    ngOnInit(): void {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationStart),
                filter(
                    (event: NavigationStart) =>
                        event.url === this.appUrlService.getPageUrlValue('PAGE_SCREEN'),
                ),
                takeUntil(this.destroy$),
            )
            .subscribe(() => {
                this.bottomSheetRef.dismiss({
                    closed: true,
                    reason: 'navigated to screen',
                });
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * @desc 快速选择小费金额
     */
    onQuickSelect(val: number) {
        this.inputValue.set(val);
    }

    /**
     * @desc 切换小费类型
     */
    changeType(type: any) {
        this.tipType.set(type);
    }

    cancel() {
        this.bottomSheetRef.dismiss({ closed: true });
    }

    tipConfirm() {
        this.bottomSheetRef.dismiss({ closed: true });
    }
}
