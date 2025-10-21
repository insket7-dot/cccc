import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, NavigationStart } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
        { name: 'page.fixed', value: 'fixed' }
    ];
    tipType: 'percentage' | 'fixed' = 'percentage';
    percentages = [30, 50, 80];
    selectedPercentage: number | null = null;
    fixedAmount: number | null = null;

    constructor(
        private bottomSheetRef: MatBottomSheetRef<AddTipsComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private router: Router
    ) {}
     ngOnInit(): void {
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationStart),
                filter((event: NavigationStart) => event.url === '/screen'),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.bottomSheetRef.dismiss({
                    closed: true,
                    reason: 'navigated to screen'
                });
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    changeType(type: any) {
        this.tipType = type;
    }

    cancel() {
        this.bottomSheetRef.dismiss({ closed: true });
    }
}
