import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-details',
    standalone: true,
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss',

    imports: [
        CommonModule,
        MatButtonModule,
        TranslateModule,
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
    ],
})
export class detailsComponent extends AbstractAppPage {
    @Input() item: any;
    @Output() onClose = new EventEmitter<void>();
    @Output() onAddToCart = new EventEmitter<{
        item: any;
        selectedOptions: Record<string, boolean>;
    }>();

    private readonly _formBuilder = inject(FormBuilder);

    toppings: any = this._formBuilder.group({});
    constructor() {
        super();
    }

    ngOnInit(): void {
        // 初始化时动态构建表单（根据传入的可选项目）
        this.initForm();
    }

    private initForm(): void {
        if (!this.item?.grillList) return;

        const formControls: Record<string, boolean> = {};

        this.item.grillList.forEach((grill: any) => {
            grill.itemList.forEach((item: any) => {
                formControls[item.productId] = false;
            });
        });

        this.toppings = this._formBuilder.group(formControls);
    }

    addToCart(): void {
        if (!this.item) return;

        const selectedOptions = this.toppings.value;
        this.onAddToCart.emit({
            item: this.item,
            selectedOptions,
        });

        console.log('已添加到购物车:', {
            item: this.item,
            selected: selectedOptions,
        });
        // this.close();
    }


    getPrice() {
        
    }

    close() {
        this.onClose.emit();
    }
}
