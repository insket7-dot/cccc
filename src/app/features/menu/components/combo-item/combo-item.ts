import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { CartExtra } from '@app/shared/types/cart.shared.types';
import { menuListItem, MenuRoundItem } from '@app/shared/types/menu.shared.types';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { I18nFieldPipe, PriceI18nPipe } from '@app/shared/pipes/i18n-field.pipe';

@Component({
    selector: 'app-combo-item',
    imports: [TranslateModule, MatRadioModule, I18nFieldPipe, PriceI18nPipe],
    templateUrl: './combo-item.html',
    styleUrl: './combo-item.scss',
})
export class ComboItem extends AbstractAppPage {
    constructor() {
        super();
    }
    @Input() data: menuListItem | null | undefined = null;
    @Output() selectedChange = new EventEmitter<CartExtra>();

    readonly selectedMeal = signal<MenuRoundItem[]>([]);

    item = computed(() => this.data);

    getSelectedRound(id: number): string | null {
        const g = this.selectedMeal().find((x) => x.round === id);
        return g?.itemList?.[0]?.skuId ?? null;
    }

    onRoundChange(roundId: number, skuId: string) {
        const round = this.item()?.setMealList?.find((x) => x.round === roundId);

        if (!round) return;
        const selectedSku = round.itemList.find((s) => s.skuId === skuId);
        if (!selectedSku) return;

        // 更新
        const prev = this.selectedMeal();
        const existing = prev.find((g) => g.round === roundId);
        const next: MenuRoundItem[] = existing
            ? prev.map((g) => (g.round === roundId ? { ...g, itemList: [selectedSku] } : g))
            : [...prev, { ...round!, itemList: [selectedSku] }];

        this.selectedMeal.set(next);

        this.getSelection();
    }

    /**
     * @desc 外部调用-获取组装后的报文
     */
    getSelection(): CartExtra {
        const result = {
            rounds: this.selectedMeal().map((t) => ({
                roundId: t.round,
                min: t.optionalMinQuantity,
                max: t.optionalQuantity,
                itemList: t.itemList.map((x) => ({
                    skuId: x.skuId,
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
        if (this.item()?.setMealList) {
            for (const round of this.item()?.setMealList ?? []) {
                if (!this.getSelectedRound(round.round)) {
                    this.error(this.translate.instant('menu.detail.combo.required')).catch(
                        console.error,
                    );
                    return false;
                }
            }
        }
        return true;
    }
}
