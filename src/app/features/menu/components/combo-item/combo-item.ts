import { Component, computed, Input } from '@angular/core';
import { AbstractAppPage } from '@app/shared/abstracts/abstract.app.page';
import { CartExtra } from '@app/shared/types/cart.shared.types';
import { menuListItem } from '@app/shared/types/menu.shared.types';

@Component({
    selector: 'app-combo-item',
    imports: [],
    templateUrl: './combo-item.html',
    styleUrl: './combo-item.scss',
})
export class ComboItem extends AbstractAppPage {
    constructor() {
        super();
    }
    @Input() data: menuListItem | null | undefined = null;

    item = computed(() => this.data);

    /**
     * @desc 外部调用-获取组装后的报文
     */
    getSelection(): CartExtra {
        return {
            rounds: [],
        };
    }

    /**
     * @desc 外部调用-校验是否通过
     */
    validate(): boolean {
        return false;
    }
}
