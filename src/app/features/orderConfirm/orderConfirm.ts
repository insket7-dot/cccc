import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { OrderConfirmService } from './services/orderConfirm.service';
import { AppStoreService } from '@/app/shared/services/app.store.service';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AddTipsComponent } from './components/add-tips.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';


@Component({
    selector: 'app-orderConfirm',
    templateUrl: './orderConfirm.html',
    styleUrls: ['./orderConfirm.scss'],
    imports: [TranslateModule, CommonModule, MatButtonModule],
})
export class OrderConfirm extends AbstractAppPage implements OnInit, OnDestroy {
    constructor(private orderConfirmService: OrderConfirmService, private location: Location, private bottomSheet: MatBottomSheet) {
        super();
    }

    ngOnInit() {}

    ngOnDestroy() {}

    addTip() {
         const bottomSheetRef = this.bottomSheet.open(AddTipsComponent, {
                    data: [],
                    panelClass: 'cart-details-sheet',
                    disableClose: false,
                });

                bottomSheetRef.afterDismissed().subscribe((result) => {
                    console.log('面板已关闭，返回结果：', result);
                });
    }

    back() {
        this.location.back();
    }
}
