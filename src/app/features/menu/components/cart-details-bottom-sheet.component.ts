import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { Router, NavigationStart } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cart-details-bottom-sheet',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="bottom-sheet-content">
      <h3>购物车详情</h3>
      <p>商品数量：{{ data[0].price }}</p>
      <button mat-raised-button color="primary" (click)="closeSheet()">关闭</button>
    </div>
  `,
  styles: [`
    .bottom-sheet-content {
      padding: 16px;
    }
    h3 {
      margin: 0 0 16px 0;
    }
  `]
})
export class CartDetailsBottomSheetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private bottomSheetRef: MatBottomSheetRef<CartDetailsBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private router: Router,
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

  closeSheet() {
    this.bottomSheetRef.dismiss({ closed: true });
  }
}
