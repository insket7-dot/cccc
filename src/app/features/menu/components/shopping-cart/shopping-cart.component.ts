import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CartDetailsBottomSheetComponent } from '../cart-details-bottom-sheet.component';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    templateUrl: './shopping-cart.component.html',
    styleUrl: './shopping-cart.component.scss',

    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        TranslateModule,
    ],
})
export class ShoppingCartComponent extends AbstractAppPage {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    constructor(private bottomSheet: MatBottomSheet) {
        super();
    }

    async continue() {
        await this.confirm('page.continue', {}, async (result): Promise<any> => {
            if (result.role === 'ok') {
                this.router.navigate(['/orderConfirm']).catch((error) => console.error(error));
            } else {
                return false;
            }
        });
    }

    showDetails() {
        const bottomSheetRef = this.bottomSheet.open(CartDetailsBottomSheetComponent, {
            data: [{ id: 1, name: '商品1', price: 99 }],
            panelClass: 'cart-details-sheet',
            disableClose: false,
        });

        bottomSheetRef.afterDismissed().subscribe((result) => {
            console.log('面板已关闭，返回结果：', result);
        });
    }

    /**
     * @desc 关闭购物车弹框
     */
    close() {
        this.visible = false;
        this.visibleChange.emit(this.visible);
    }
}
