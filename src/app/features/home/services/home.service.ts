import { Injectable, Inject } from '@angular/core';
import { ResultVO } from '@rydeen/angular-framework';
import { AbstractAppService } from '@app/shared/abstracts/abstract.app.service';
import { AppUrl } from '@app/core/constants/app.url';
import type { IDatabaseService } from '@app/core/interfaces/database.interface';
import { DATABASE_SERVICE } from '@app/core/tokens/database.token';
import {
    MenuModel as MenuData,
    MenuFields,
    MenuTable,
    MenuModel,
} from '@app/shared/types/menu.shared.types';
import { QueryBuilder, LIKE } from '@app/core/builders/query-builder';

@Injectable({ providedIn: 'root' })
export class HomeService extends AbstractAppService {
    constructor(@Inject(DATABASE_SERVICE) private readonly databaseService: IDatabaseService) {
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
    async syncAndCacheMenus(): Promise<ResultVO<MenuModel[]>> {
        // 1. 从 API 获取原始数据
        const menuResult = await this.fetchAllMenu();
        if (!menuResult.success || !menuResult.data) {
            return menuResult;
        }
        console.log(`[HomeService] 从 API 获取了 ${menuResult.data.length} 个菜单项.`);

        // 2. 为菜单项添加搜索关键词
        const menusWithKeywords = this.addKeywordsToMenus(menuResult.data);
        console.log(`[HomeService] 已为 ${menusWithKeywords.length} 个菜单项添加了搜索关键词.`);

        // 3. 先清空旧数据
        const deleteQuery = QueryBuilder.delete(MenuTable);
        await this.databaseService.delete(deleteQuery);

        // 4. 批量插入经过处理的新数据
        if (menusWithKeywords.length > 0) {
            const rows = menusWithKeywords.map((v) => ({
                id: v.id,
                name: v.name,
                category: v.category,
                price: v.price,
                tags: v.tags ? JSON.stringify(v.tags) : null,
                keywords: Array.isArray(v.keywords)
                    ? JSON.stringify(v.keywords)
                    : (v.keywords ?? null),
            }));
            const insertQuery = QueryBuilder.insert(MenuTable).valuesList(rows as any);
            await this.databaseService.insert(insertQuery);
        }

        console.log(`[HomeService] ${menusWithKeywords.length} 个菜单项已同步到 SQLite.`);
        return {
            success: true,
            data: menusWithKeywords,
        } as ResultVO<MenuModel[]>;
    }

    /**
     * 在本地 SQLite 数据库中搜索菜单项.
     * @param keyword 搜索关键词
     * @returns 返回匹配的菜单项数组.
     */
    async searchMenus(keyword: string): Promise<MenuData[]> {
        debugger;
        const trimmedKeyword = (keyword || '').trim();
        if (!trimmedKeyword) {
            // 如果关键词为空, 可以选择返回所有菜单或一个空数组
            // 这里我们返回空数组以匹配之前的行为
            return [];
        }

        let query = QueryBuilder.select(MenuTable).selectAll();
        if (trimmedKeyword) {
            const kw = `%${trimmedKeyword}%`;
            query = query.where(MenuFields.name, LIKE, kw);
        }
        query = query.orderBy(MenuFields.category, 'asc').orderBy(MenuFields.name, 'asc');
        const rows = await this.databaseService.query<any>(query);
        return rows.map(
            (r: any) =>
                ({
                    id: r.id,
                    name: r.name,
                    category: r.category,
                    price: Number(r.price),
                    tags: typeof r.tags === 'string' ? safeParseJsonArray(r.tags) : r.tags,
                    keywords:
                        typeof r.keywords === 'string'
                            ? safeParseJsonArray(r.keywords)
                            : r.keywords,
                }) as MenuData,
        );
    }

    /**
     * 为菜单项添加搜索关键词
     * @param items 原始菜单数据
     * @returns 带有搜索关键词的菜单数据
     */
    private addKeywordsToMenus(items: MenuData[]): MenuData[] {
        return items.map((item) => {
            item.keywords = this.generateKeywords(item);
            return item;
        });
    }

    /**
     * 生成搜索关键词
     * @param item 菜单项
     * @returns 搜索关键词字符串
     */
    private generateKeywords(item: MenuData): string[] {
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

        return keywords;
    }
}

function safeParseJsonArray(input: string): any[] | undefined {
    try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}
