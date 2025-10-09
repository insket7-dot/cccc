import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { MenuService } from './services/menu.service';
import { MenuData } from '../../shared/types/menu.shared.types';
import { AbstractAppPage } from '../../shared/abstracts/abstract.app.page';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatChipsModule, TranslateModule],
    templateUrl: './menu.html',
    styleUrl: './menu.scss',
})
export class Menu extends AbstractAppPage implements OnInit {
    protected readonly items = signal<MenuData[]>([]);

    constructor(private readonly menuService: MenuService) {
        super();
    }

    async ngOnInit(): Promise<void> {
        try {
            const menus = await this.menuService.getAllMenus();
            this.items.set(menus);
        } catch (err) {
            this.items.set([]);
            console.error('[Menu]', this.translate.instant('app.system.database.loadFailed'), err);
        }
    }
}
