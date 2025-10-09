import { Injectable, Inject } from '@angular/core';
import { DATABASE_SERVICE } from '../tokens/database.token';
import type { IDatabaseService } from '../interfaces/database.interface';

interface ManifestItem {
    version: number;
    name: string;
    file: string;
    type?: 'sql' | 'ts';
    sha256?: string;
}

interface Manifest {
    migrations: ManifestItem[];
}

@Injectable({ providedIn: 'root' })
export class MigrationService {
    private readonly manifestUrl = '/assets/db/migrations/manifest.json';
    private readonly migrationsBaseUrl = '/assets/db/migrations/';

    constructor(@Inject(DATABASE_SERVICE) private readonly database: IDatabaseService) {}

    public async run(): Promise<void> {
        await this.ensureSchemaTable();
        const currentVersion = await this.getCurrentVersion();
        const manifest = await this.loadManifest();
        const pendings = manifest.migrations
            .filter((m) => m.version > currentVersion)
            .sort((a, b) => a.version - b.version);

        for (const m of pendings) {
            if ((m.type || 'sql') === 'sql') {
                await this.applySqlMigration(m);
            } else {
                // 预留 TS 迁移支持（如需可扩展）
                throw new Error(
                    `Unsupported migration type: ${m.type} for V${m.version} ${m.name}`,
                );
            }
            await this.recordApplied(m);
        }
    }

    private async ensureSchemaTable(): Promise<void> {
        const createMetaTable = `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at TEXT NOT NULL,
                checksum TEXT
            );
        `;
        await this.database.executeRaw(createMetaTable);
    }

    private async getCurrentVersion(): Promise<number> {
        const rows = await this.database.queryRaw<{ maxVersion: number }>(
            'SELECT COALESCE(MAX(version), 0) as maxVersion FROM schema_migrations',
        );
        return (rows[0]?.maxVersion ?? 0) as number;
    }

    private async loadManifest(): Promise<Manifest> {
        const resp = await fetch(this.manifestUrl, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`Failed to load migrations manifest: ${resp.status}`);
        const json = await resp.json();
        const manifest = json as Manifest;
        if (!manifest?.migrations?.length) {
            throw new Error('Migrations manifest is empty');
        }
        return manifest;
    }

    private async applySqlMigration(m: ManifestItem): Promise<void> {
        const url = this.migrationsBaseUrl + m.file;
        const resp = await fetch(url, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`Failed to load migration file: ${m.file}`);
        const text = await resp.text();
        // 直接执行整段 SQL，底层实现负责事务（Web 端 execute/原生 worker.execute 均支持多语句）
        await this.database.executeRaw(text);
    }

    private async recordApplied(m: ManifestItem): Promise<void> {
        const checksum = m.sha256 ?? null;
        const now = new Date().toISOString();
        const sql =
            'INSERT INTO schema_migrations(version, name, applied_at, checksum) VALUES(?, ?, ?, ?)';
        await this.database.executeRaw(sql, [m.version, m.name, now, checksum]);
    }
}
