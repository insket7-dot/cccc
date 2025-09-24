import {Injectable} from '@angular/core';
import {ResultVO} from '@rydeen/angular-framework';
import {AbstractAppService} from "../../../shared/abstracts/abstract.app.service";
import {AppUrl} from "../../../core/constants/app.url";
import {DatabaseService} from "../../../core/services/database.service";
import {Menu} from "../../../shared/entities/menu.entity";
import {MenuData} from "../../../shared/types/menu.shared.types";
import {MenuWorkerService} from "../../menu/services/menu-worker.service";

@Injectable({providedIn: 'root'})
export class HomeService extends AbstractAppService {

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly menuWorkerService: MenuWorkerService
    ) {
        super();
    }

    async fetchAllMenu(): Promise<ResultVO<MenuData[]>> {
        return await this.request<MenuData[]>(AppUrl.MENU_ALL);
    }

    /**
     * 从 API 获取菜单数据, 通过 Worker 添加搜索关键词, 然后将其同步到本地 SQLite 数据库.
     * @returns 返回获取到的菜单项数量.
     * @throws 如果 API 请求失败或返回空数据.
     */
    async syncAndCacheMenus(): Promise<number> {
        // 1. 从 API 获取原始数据
        const menuResult = await this.fetchAllMenu();
        if (!menuResult.success || !menuResult.data) {
            throw new Error(menuResult.msg || '获取菜单数据失败');
        }
        console.log(`[HomeService] 从 API 获取了 ${menuResult.data.length} 个菜单项.`);

        // 2. 将数据发送到 Worker 进行预处理 (添加 keywords)
        const menusWithKeywords = await this.menuWorkerService.addKeywordsToMenus(menuResult.data);
        console.log(`[HomeService] Worker 已为 ${menusWithKeywords.length} 个菜单项添加了搜索关键词.`);

        // 3. 先清空旧数据
        const deleteQuery = this.databaseService.createQueryBuilder(Menu, 'menu').delete();
        await this.databaseService.execute(deleteQuery);

        // 4. 批量插入经过处理的新数据
        if (menusWithKeywords.length > 0) {
            const insertQuery = this.databaseService
                .createQueryBuilder(Menu, 'menu')
                .insert()
                .values(menusWithKeywords);
            await this.databaseService.execute(insertQuery);
        }

        console.log(`[HomeService] ${menusWithKeywords.length} 个菜单项已同步到 SQLite.`);
        return menusWithKeywords.length;
    }

    /**
     * 在本地 SQLite 数据库中搜索菜单项.
     * @param keyword 搜索关键词
     * @returns 返回匹配的菜单项数组.
     */
    async searchMenus(keyword: string): Promise<Menu[]> {
        const trimmedKeyword = (keyword || '').trim();
        if (!trimmedKeyword) {
            // 如果关键词为空, 可以选择返回所有菜单或一个空数组
            // 这里我们返回空数组以匹配之前的行为
            return [];
        }

        const query = this.databaseService
            .createQueryBuilder(Menu, 'menu')
            .select()
            .where('menu.keywords LIKE :keyword', { keyword: `%${trimmedKeyword}%` });

        return await this.databaseService.query<Menu>(query);
    }
}
