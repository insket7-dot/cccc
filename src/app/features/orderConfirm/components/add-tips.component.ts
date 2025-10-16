import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@Component({
    selector: 'app-add-tips',
    standalone: true,
    imports: [CommonModule, MatButtonModule,MatInputModule,FormsModule,TranslateModule],
    templateUrl: './add-tips.component.html',
    styleUrls: ['./add-tips.component.scss'],
})
export class AddTipsComponent {
    tipTypeList = [{
        name: 'page.percentage',
        value: 'percentage'
    },{
        name: 'page.fixed',
        value: 'fixed'
    }]
    tipType: 'percentage' | 'fixed' = 'percentage';

     percentages = [30, 50, 80];

     selectedPercentage: number | null = null;

     fixedAmount: number | null = null;
    constructor(
        private bottomSheetRef: MatBottomSheetRef<AddTipsComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {}


    changeType(type:any) {
        this.tipType = type;
    }


    cancel() {
         this.bottomSheetRef.dismiss({ closed: true });
    }
}
