import {Injectable, Inject} from '@angular/core';
import {ResultVO} from '@rydeen/angular-framework';
import {AbstractAppService} from "../../../shared/abstracts/abstract.app.service";
import {AppUrl} from "../../../core/constants/app.url";
import type {IDatabaseService} from "../../../core/interfaces/database.interface";
import { DATABASE_SERVICE } from '../../../core/tokens/database.token';
import {MenuData} from "../../../shared/types/menu.shared.types";
import {MenuEntity} from "../../../shared/entities";

@Injectable({providedIn: 'root'})
export class HomeService extends AbstractAppService {

    constructor(
        @Inject(DATABASE_SERVICE) private readonly databaseService: IDatabaseService
    ) {
        super();
    }

    async fetchAllMenu(): Promise<ResultVO<MenuData[]>> {
        return await this.request<MenuData[]>(AppUrl.MENU_ALL);
    }

    /**
     * 从 API 获取菜单数据, 添加搜索关键词, 然后将其同步到本地 SQLite 数据库.
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

        // 2. 为菜单项添加搜索关键词
        const menusWithKeywords = this.addKeywordsToMenus(menuResult.data);
        console.log(`[HomeService] 已为 ${menusWithKeywords.length} 个菜单项添加了搜索关键词.`);

        // 3. 先清空旧数据
        const deleteQuery = this.databaseService.createQueryBuilder(MenuEntity, 'menu').delete();
        await this.databaseService.execute(deleteQuery);

        // 4. 批量插入经过处理的新数据
        if (menusWithKeywords.length > 0) {
            const insertQuery = this.databaseService
                .createQueryBuilder(MenuEntity, 'menu')
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
    async searchMenus(keyword: string): Promise<MenuEntity[]> {
        const trimmedKeyword = (keyword || '').trim();
        if (!trimmedKeyword) {
            // 如果关键词为空, 可以选择返回所有菜单或一个空数组
            // 这里我们返回空数组以匹配之前的行为
            return [];
        }

        const query = this.databaseService
            .createQueryBuilder(MenuEntity, 'menu')
            .select()
            .where('menu.keywords LIKE :keyword', { keyword: `%${trimmedKeyword}%` });

        return await this.databaseService.query<MenuEntity>(query);
    }

    /**
     * 为菜单项添加搜索关键词
     * @param items 原始菜单数据
     * @returns 带有搜索关键词的菜单数据
     */
    private addKeywordsToMenus(items: MenuData[]): MenuEntity[] {
        return items.map(item => {
            const keywords = this.generateKeywords(item);
            return {
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                tags: item.tags,
                keywords: keywords
            } as MenuEntity;
        });
    }

    /**
     * 生成搜索关键词
     * @param item 菜单项
     * @returns 搜索关键词字符串
     */
    private generateKeywords(item: MenuData): string {
        const keywords: string[] = [];

        // 添加名称
        keywords.push(item.name);

        // 添加分类
        keywords.push(item.category);

        // 添加标签
        if (item.tags && item.tags.length > 0) {
            keywords.push(...item.tags);
        }

        // 添加价格范围关键词
        if (item.price < 10) {
            keywords.push('便宜', '实惠');
        } else if (item.price < 30) {
            keywords.push('中等', '适中');
        } else {
            keywords.push('高端', '豪华');
        }

        return keywords.join(' ');
    }
}
