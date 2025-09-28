// src/app/shared/entities/menu.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'menus' }) // 对应数据库中的 'menus' 表
export class MenuEntity {
    @PrimaryColumn({ type: 'text' }) // 使用从 API 获取的 id 作为主键
    id!: string;

    @Column({ type: 'text' })
    name!: string;

    @Column({ type: 'text' })
    category!: string;

    @Column({ type: 'real' })
    price!: number;

    @Column({ type: 'simple-json', nullable: true })
    tags?: string[];

    @Column({ type: 'text', nullable: true })
    keywords?: string;
}
