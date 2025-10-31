import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { MenuGrillItem, menuListItem } from '@app/shared/types/menu.shared.types';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { I18nFieldPipe } from '@app/shared/pipes/i18n-field.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { CartExtra } from '@app/shared/types/cart.shared.types';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';

@Component({
    selector: 'app-single-item',
    standalone: true,
    imports: [MatCheckboxModule, MatRadioModule, TranslateModule, I18nFieldPipe, CommonModule],
    templateUrl: './single-item.html',
    styleUrl: './single-item.scss',
})
export class SingleItem extends AbstractAppPage {
    @Input() data: menuListItem | null | undefined = null;
    @Output() specChange = new EventEmitter<string>();

    constructor() {
        super();
    }

    item = computed(() => this.data);
    // 当前选中的规格（单选）
    readonly selectedSpec = signal<string | null>(null);

    // 当前选中的加料（多选）
    readonly selectedGrills = signal<MenuGrillItem[]>([]);

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
            : [
                  ...prev,
                  {
                      grillCode: grill.grillCode,
                      grillNameCn: grill.grillNameCn,
                      grillNameEn: grill.grillNameEn,
                      maxitemCount: grill.maxitemCount,
                      minItemCount: grill.minItemCount,
                      itemList: [selectedSku],
                  },
              ];
        console.log(next);
        this.selectedGrills.set(next);
    }

    getSelectedSku(grillId: string): string | null {
        const g = this.selectedGrills().find((x) => x.grillCode === grillId);
        return g?.itemList?.[0]?.productId ?? null;
    }

    /**
     * @desc 外部调用-获取组装后的报文
     */
    getSelection(): CartExtra {
        return {
            skuId: this.selectedSpec() ?? undefined,
            grillList: this.selectedGrills().map((t) => ({
                grillId: t.grillCode,
                itemList: t.itemList.map((x) => ({
                    productId: x.productId,
                    price: x.price,
                    quantity: 1,
                })),
            })),
        };
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
