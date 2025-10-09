import { Inject, Injectable } from '@angular/core';
import { DATABASE_SERVICE } from '../../../core/tokens/database.token';
import { IDatabaseService } from '../../../core/interfaces/database.interface';
import { LE, EQ, GE, LIKE, QueryBuilder} from '../../../core/builders/query-builder';
import { UserModel, UserFields, UserTable, UserFieldKey } from '../../../shared/types/user.shared.types';
import { AbstractAppService } from '../../../shared/abstracts/abstract.app.service';


@Injectable({ providedIn: 'root' })
export class UserService extends AbstractAppService {
    constructor(
        @Inject(DATABASE_SERVICE) private readonly database: IDatabaseService,
    ) {
        super();
    }

    async create(user: UserModel): Promise<void> {
        console.log('UserService.create called with:', user);
        const now = new Date().toISOString();
        const payload = { ...user, created_at: now, updated_at: now } as UserModel;
        console.log('UserService.create payload:', payload);
        const query = QueryBuilder.insert(UserTable).values(payload);
        await this.database.insert(query);
        console.log('UserService.create completed successfully');
    }

    async update(id: string, user: Partial<UserModel>): Promise<void> {
        console.log('UserService.update called with id:', id, 'user:', user);
        const payload = { ...user, updated_at: new Date().toISOString() } as any;
        console.log('UserService.update payload:', payload);
        const query = QueryBuilder.update(UserTable)
            .set(payload)
            .where(UserFields.id as UserFieldKey, EQ, id);
        await this.database.update(query);
        console.log('UserService.update completed successfully');
    }

    async remove(id: string): Promise<void> {
        console.log('UserService.remove called with id:', id);
        const query = QueryBuilder.delete(UserTable)
            .where(UserFields.id as UserFieldKey, EQ, id);
        await this.database.delete(query);
        console.log('UserService.remove completed successfully');
    }

    async search(params: {
        keyword?: string;
        gender?: string;
        start?: string;
        end?: string;
        page?: number;
        pageSize?: number;
    }): Promise<UserModel[]> {
        console.log('UserService.search called with params:', params);
        const page = Math.max(1, params.page || 1);
        const pageSize = Math.max(1, Math.min(100, params.pageSize || 10));
        const offset = (page - 1) * pageSize;
        let query = QueryBuilder.select(UserTable).selectAll();
        if (params.keyword && params.keyword.trim()) {
            query = query.where(UserFields.name, LIKE, `%${params.keyword}%`);
        }
        if (params.gender) {
            query = query.andWhere(UserFields.gender, EQ, params.gender);
        }
        if (params.start) {
            query = query.andWhere(UserFields.birthday, GE, params.start);
        }
        if (params.end) {
            query = query.andWhere(UserFields.birthday, LE, params.end);
        }
        query = query.orderBy(UserFields.created_at, 'desc').limit(pageSize).offset(offset);
        const rows = await this.database.query<any>(query);
        console.log('UserService.search found rows:', rows.length, 'rows');
        const result = rows.map(
            (r: any) =>
                ({
                    id: r.id,
                    name: r.name,
                    gender: r.gender,
                    birthday: r.birthday,
                    email: r.email,
                    phone: r.phone,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                }) as UserModel,
        );
        console.log('UserService.search returning:', result);
        return result;
    }
}
