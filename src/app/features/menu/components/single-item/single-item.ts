import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { MenuGrillItem, menuListItem } from '@app/shared/types/menu.shared.types';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { I18nFieldPipe, PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { CartExtra } from '@app/shared/types/cart.shared.types';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';

@Component({
    selector: 'app-single-item',
    standalone: true,
    imports: [
        MatCheckboxModule,
        MatRadioModule,
        TranslateModule,
        I18nFieldPipe,
        CommonModule,
        PriceI18nPipe,
    ],
    templateUrl: './single-item.html',
    styleUrl: './single-item.scss',
})
export class SingleItem extends AbstractAppPage {
    @Input() data: menuListItem | null | undefined = null;
    @Output() selectedChange = new EventEmitter<CartExtra>();

    constructor() {
        super();

    }

    item = computed(() => this.data);
    // 当前选中的规格（单选）
    readonly selectedSpec = signal<string | null>(null);
    readonly selectedSpecName = signal<string | null>(null);

    // 当前选中的加料（多选）
    readonly selectedGrills = signal<MenuGrillItem[]>([]);

    onSpecChange(value: string) {
        this.selectedSpec.set(value);
        this.selectedSpecName.set(this.item()?.specList?.find((x) => x.skuId === value)?.skuNameCn ?? null);
        this.getSelection();
    }

    onGrillChange(grillId: string, productId: string) {
        const grill = this.item()?.grillList?.find((g) => g.grillCode === grillId);
        if (!grill) return;

        const selectedSku = grill.itemList.find((s) => s.productId === productId);
        if (!selectedSku) return;

        // 更新 selectedGrills signal
        const prev = this.selectedGrills();
        const existing = prev.find((g) => g.grillCode === grillId);
        const next: MenuGrillItem[] = existing
            ? prev.map((g) => (g.grillCode === grillId ? { ...g, itemList: [selectedSku] } : g))
            : [...prev, { ...grill, itemList: [selectedSku] }];
        this.selectedGrills.set(next);

        this.getSelection();
    }

    getSelectedSku(grillId: string): string | null {
        const g = this.selectedGrills().find((x) => x.grillCode === grillId);
        return g?.itemList?.[0]?.productId ?? null;
    }

    /**
     * @desc 外部调用-获取组装后的报文
     */
    getSelection(): CartExtra {
        const specItem = this.item()?.specList?.find((x) => x.skuId === this.selectedSpec());
        const result = {
            skuId: this.selectedSpec() ?? undefined,
            skuNameCn: this.selectedSpecName() ?? undefined,
            skuPrice: specItem?.price ?? 0,
            grillList: this.selectedGrills().map((t) => ({
                grillId: t.grillCode,
                itemList: t.itemList.map((x) => ({
                    productId: x.productId,
                    productNameCn: x.productNameCn,
                    price: x.price,
                    quantity: 1,
                })),
            })),
        };
        this.selectedChange.emit(result);
        return result;
    }

    /**
     * @desc 外部调用-校验是否通过
     */
    validate(): boolean {
        if (!this.selectedSpec()) {
            this.error(this.translate.instant('menu.detail.spec.required')).catch((error) =>
                console.error(error),
            );
            return false;
        }
        // 存在加料
        if (this.item()?.grillList?.length) {
            for (const g of this.item()?.grillList ?? []) {
                if (!this.getSelectedSku(g.grillCode)) {
                    this.error(this.translate.instant('menu.detail.grill.required')).catch(
                        (error) => console.error(error),
                    );
                    return false;
                }
            }
        }
        return true;
    }
}
