import { Component, Inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
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
import { PriceService } from '@/app/shared/services/price.service';

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
        { name: 'page.percentage', value: 'percentage' },
        { name: 'page.fixed', value: 'fixed' },
    ];
    percentages = [30, 50, 80];
    tipType = signal<'percentage' | 'fixed'>('percentage');
    selectedPercentage = signal<number | null>(null);
    fixedAmount = signal<number | null>(null);

    constructor(
        private bottomSheetRef: MatBottomSheetRef<AddTipsComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private router: Router,
        private appUrlService: AppUrlService,
        private cartService: CartService,
        private priceService: PriceService,
    ) {}
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

    cartTotalPrice = computed(() => {
        return this.cartService.cartTotal().total;
    });

    totalTip = computed(() => {
        if (this.tipType() === 'percentage') {
            const percentage = this.selectedPercentage() ?? 0;
            const total = this.cartTotalPrice() ?? 0;
            return this.priceService.toNumber((percentage / 100) * total);
        } else {
            return this.fixedAmount() ?? 0;
        }
    });

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
