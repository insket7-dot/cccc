import {Component, signal} from '@angular/core';
import {WorkerSampleService} from "../../services/worker-sample.service";
import {MatButton} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatCardModule} from "@angular/material/card";
import {HomeService} from "./home.service";
import {AbstractPage} from "../../../commons/component/abstractPage";

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
    protected readonly searchItems = signal<Array<{ id: string; name: string; category: string; price: number; tags?: string[] }>>([]);

    constructor(private readonly workerSample: WorkerSampleService, private readonly homeService: HomeService) {
        super();
    }

    async onMenuProcess(): Promise<void> {
        let itemsResult = await this.homeService.fetchAllMenu();
        if (!itemsResult.success) {
            await this.error(itemsResult.msg || '获取菜单失败');
            return;
        }
        let items = itemsResult.data
        const list = await this.workerSample.processMenu(items);
        const localMsg = `菜单处理完成（本地），已构建索引，共 ${list.length} 项`;
        this.processLog.set(localMsg);
    }

    async onMenuSearch(): Promise<void> {
        const keyword = (this.searchQuery() || '').trim();
        const items = await this.workerSample.searchMenu(keyword || '');
        this.searchItems.set(items);
        this.searchLog.set(`查询完成，关键字“${keyword || '（空）'}”，匹配 ${items.length} 项`);
    }
}
