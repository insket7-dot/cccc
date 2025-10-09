import { Inject, Injectable } from '@angular/core';
import { AbstractAppService } from '../../../shared/abstracts/abstract.app.service';
import type { IDatabaseService } from '../../../core/interfaces/database.interface';
import { DATABASE_SERVICE } from '../../../core/tokens/database.token';
import { QueryBuilder } from '../../../core/builders/query-builder';
import { MenuFields, MenuTable } from '../../../shared/types/menu.shared.types';
import { MenuData } from '../../../shared/types/menu.shared.types';

@Injectable({
    providedIn: 'root',
})
export class MenuService extends AbstractAppService {
    constructor(
        @Inject(DATABASE_SERVICE) private readonly databaseService: IDatabaseService,
    ) {
        super();
    }

    /**
     * 从本地数据库读取全部菜单（使用 like '%%' 获取全部，并按分类与名称排序）
     */
    async getAllMenus(): Promise<MenuData[]> {
        const query = QueryBuilder.select(MenuTable)
            .selectAll()
            .orderBy(MenuFields.category, 'asc')
            .orderBy(MenuFields.name, 'asc');
        const rows = await this.databaseService.query<any>(query);
        return rows.map((r: any) => {
            const tags = typeof r.tags === 'string' ? this.safeParseJsonArray(r.tags) : r.tags;
            return {
                id: r.id,
                name: r.name,
                category: r.category,
                price: Number(r.price),
                tags: Array.isArray(tags) ? tags : undefined,
                keywords: Array.isArray(r.keywords) ? r.keywords : undefined,
            } as MenuData;
        });
    }

    private safeParseJsonArray(input: string): any[] | undefined {
        try {
            const v = JSON.parse(input);
            return Array.isArray(v) ? v : undefined;
        } catch {
            return undefined;
        }
    }

}
