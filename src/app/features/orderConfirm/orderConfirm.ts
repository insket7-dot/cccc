import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';
import { TranslateModule } from '@ngx-translate/core';
import { OrderConfirmService } from './services/orderConfirm.service';
import { AppStoreService } from '@/app/shared/services/app.store.service';
import { Location } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-orderConfirm',
    templateUrl: './orderConfirm.html',
    styleUrls: ['./orderConfirm.scss'],
    imports: [TranslateModule, CommonModule,MatButtonModule]
})
export class OrderConfirm extends AbstractAppPage implements OnInit, OnDestroy {
    constructor(
        private orderConfirmService: OrderConfirmService,
        private location: Location
    ) {
        super();
    }

    ngOnInit() {}

    ngOnDestroy() {}


    back() {
 this.location.back();
    }
}
