import {Component, signal} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatCardModule} from "@angular/material/card";
import {HomeService} from "./services/home.service";
import {AbstractPage} from "../../shared/abstracts/abstractPage";
import {MenuEntity} from "../../shared/entities";

@Component({
    selector: 'app-home',
    imports: [
        MatButton,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatListModule,
        MatChipsModule,
        MatCardModule
    ],
    templateUrl: './home.html',
    styleUrl: './home.scss'
})
export class Home extends AbstractPage {

    protected readonly searchQuery = signal<string>('');
    protected readonly processLog = signal<string | null>(null);
    protected readonly searchLog = signal<string | null>(null);
    protected readonly searchItems = signal<MenuEntity[]>([]);

    constructor(private readonly homeService: HomeService) {
        super();
    }

    async onMenuProcess(): Promise<void> {
        try {
            this.processLog.set('正在同步菜单数据到本地数据库...');
            const count = await this.homeService.syncAndCacheMenus();
            const successMsg = `菜单同步成功，共 ${count} 项数据已存入 SQLite.`;
            this.processLog.set(successMsg);
            await this.success(successMsg);
        } catch (e: any) {
            this.processLog.set(`菜单同步失败: ${e.message}`);
            await this.error(e.message);
        }
    }

    async onMenuSearch(): Promise<void> {
        try {
            const keyword = (this.searchQuery() || '').trim();
            const items = await this.homeService.searchMenus(keyword);
            this.searchItems.set(items);
            this.searchLog.set(`查询完成，关键字“${keyword || '（空）'}”，匹配 ${items.length} 项`);
        } catch (e: any) {
            this.searchLog.set(`菜单搜索失败: ${e.message}`);
            await this.error(e.message);
        }
    }
}
