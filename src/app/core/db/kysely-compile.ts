import { Kysely, Dialect, Driver, CompiledQuery, DatabaseConnection, QueryResult } from 'kysely';
import { SqliteAdapter } from 'kysely';
import { SqliteQueryCompiler } from 'kysely';
import { SqliteIntrospector } from 'kysely';
import type { DB } from './schema';

class NoopDriver implements Driver {
    async init(): Promise<void> {}
    async acquireConnection(): Promise<DatabaseConnection> {
        return {
            executeQuery: async (_query: CompiledQuery): Promise<QueryResult<any>> => {
                throw new Error('NoopDriver cannot execute queries. Use .compile() to get SQL.');
            },
            streamQuery: () => {
                throw new Error('NoopDriver cannot stream queries.');
            },
        } as DatabaseConnection;
    }
    async beginTransaction(): Promise<void> {}
    async commitTransaction(): Promise<void> {}
    async rollbackTransaction(): Promise<void> {}
    async releaseConnection(): Promise<void> {}
    async destroy(): Promise<void> {}
}

class CompileOnlySqliteDialect implements Dialect {
    createDriver(): Driver {
        return new NoopDriver();
    }
    createAdapter() {
        return new SqliteAdapter();
    }
    createIntrospector(db: Kysely<any>) {
        return new SqliteIntrospector(db);
    }
    createQueryCompiler() {
        return new SqliteQueryCompiler();
    }
}

export const sqlBuilder = new Kysely<DB>({
    dialect: new CompileOnlySqliteDialect(),
});
