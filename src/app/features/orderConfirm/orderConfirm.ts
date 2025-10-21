import { Component, OnInit, OnDestroy, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { OrderConfirmService } from './services/orderConfirm.service';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AddTipsComponent } from './components/add-tips.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AppStoreService } from '@/app/shared/services/app.store.service';

@Component({
    selector: 'app-orderConfirm',
    templateUrl: './orderConfirm.html',
    styleUrls: ['./orderConfirm.scss'],
    imports: [TranslateModule, CommonModule, MatButtonModule],
})
export class OrderConfirm extends AbstractAppPage implements OnInit, OnDestroy {
storeBaseInfo:any
    constructor(
        private orderConfirmService: OrderConfirmService,
        private location: Location,
        private bottomSheet: MatBottomSheet,
        private appStoreService: AppStoreService
    ) {
        super();
        this.storeBaseInfo = computed(() => this.appStoreService.storeBaseInfoValue());

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
        });
    }

    back() {
        this.location.back();
    }
}
