import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { menuListItem } from '@app/shared/types/menu.shared.types';
import { AppMenuService } from '@app/shared/services/app.menu.service';

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
    appMenuService = inject(AppMenuService);
    @Input() id: string | null = '';
    @Output() onClose = new EventEmitter<void>();
    @Output() onAddToCart = new EventEmitter<{
        item: menuListItem | null;
        selectedOptions: Record<string, boolean>;
    }>();

    // 菜品详情数据
    item = computed(() => {
        const menuMap = this.appMenuService.menuIdMapValue();
        return this.id ? menuMap.get(this.id) : null;
    });

    totalPrice = computed(() => {
        if (!this.item()) return 0;
        return this.item()?.price;
    });

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
        if (!this.item()?.grillList) return;

        const formControls: Record<string, boolean> = {};

        this.item()?.grillList.forEach((grill: any) => {
            grill.itemList.forEach((item: any) => {
                formControls[item.productId] = false;
            });
        });

        this.toppings = this._formBuilder.group(formControls);
    }

    addToCart(): void {
        if (!this.item()) return;

        const selectedOptions = this.toppings.value;
        this.onAddToCart.emit({
            item: this.item() ?? null,
            selectedOptions,
        });

        console.log('已添加到购物车:', {
            item: this.item(),
            selected: selectedOptions,
        });
        // this.close();
    }

    getPrice() {}

    close() {
        this.onClose.emit();
    }
}
