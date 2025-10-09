import { sqlBuilder } from '../db/kysely-compile';
import type { CompiledQuery } from '../interfaces/database.interface';

/**
 * 通用查询构建器类
 * 使用构造器模式，提供类型安全的SQL构建功能
 */
export class QueryBuilder {
    protected query: any;

    constructor(query: any) {
        this.query = query;
    }

    /**
     * 编译查询为最终的SQL和参数
     */
    compile(): CompiledQuery {
        return this.query.compile();
    }

    /**
     * 创建插入查询构建器
     */
    static insert(tableName: string): InsertQueryBuilder {
        const query = (sqlBuilder as any).insertInto(tableName as any);
        return new InsertQueryBuilder(query);
    }

    /**
     * 创建更新查询构建器
     */
    static update(tableName: string): UpdateQueryBuilder {
        const query = (sqlBuilder as any).updateTable(tableName as any);
        return new UpdateQueryBuilder(query);
    }

    /**
     * 创建删除查询构建器
     */
    static delete(tableName: string): DeleteQueryBuilder {
        const query = (sqlBuilder as any).deleteFrom(tableName as any);
        return new DeleteQueryBuilder(query);
    }

    /**
     * 创建选择查询构建器
     */
    static select(tableName: string): SelectQueryBuilder {
        const query = (sqlBuilder as any).selectFrom(tableName as any);
        return new SelectQueryBuilder(query);
    }
}

/**
 * SQL 比较运算符（强类型约束）
 */
export enum SqlOperator {
    EQ = '=',
    NE = '!=',
    LT = '<',
    LE = '<=',
    GT = '>',
    GE = '>=',
    LIKE = 'like',
    IN = 'in',
    NOT_IN = 'not in',
    IS = 'is',
    IS_NOT = 'is not',
    BETWEEN = 'between',
}

// 便捷常量导出：支持按名直接导入使用（EQ/LIKE/GE/LE/...）
export const EQ = SqlOperator.EQ;
export const NE = SqlOperator.NE;
export const LT = SqlOperator.LT;
export const LE = SqlOperator.LE;
export const GT = SqlOperator.GT;
export const GE = SqlOperator.GE;
export const LIKE = SqlOperator.LIKE;
export const IN = SqlOperator.IN;
export const NOT_IN = SqlOperator.NOT_IN;
export const IS = SqlOperator.IS;
export const IS_NOT = SqlOperator.IS_NOT;
export const BETWEEN = SqlOperator.BETWEEN;

/**
 * 插入查询构建器
 */
export class InsertQueryBuilder extends QueryBuilder {
    constructor(query: any) {
        super(query);
    }

    /**
     * 设置要插入的数据
     */
    values(data: Record<string, any>): InsertQueryBuilder {
        this.query = this.query.values(data);
        return this;
    }

    /**
     * 批量设置要插入的数据
     */
    valuesList(dataList: Record<string, any>[]): InsertQueryBuilder {
        this.query = this.query.values(dataList);
        return this;
    }
}

/**
 * 更新查询构建器
 */
export class UpdateQueryBuilder extends QueryBuilder {
    constructor(query: any) {
        super(query);
    }

    /**
     * 设置要更新的数据
     */
    set(data: Record<string, any>): UpdateQueryBuilder {
        this.query = this.query.set(data);
        return this;
    }

    /**
     * 设置WHERE条件
     */
    where(column: string, operator: SqlOperator, value: any): UpdateQueryBuilder {
        this.query = this.query.where(column, operator, value);
        return this;
    }

    /**
     * 添加AND条件
     */
    andWhere(column: string, operator: SqlOperator, value: any): UpdateQueryBuilder {
        this.query = this.query.where(column, operator, value);
        return this;
    }
}

/**
 * 删除查询构建器
 */
export class DeleteQueryBuilder extends QueryBuilder {
    constructor(query: any) {
        super(query);
    }

    /**
     * 设置WHERE条件
     */
    where(column: string, operator: SqlOperator, value: any): DeleteQueryBuilder {
        this.query = this.query.where(column, operator, value);
        return this;
    }

    /**
     * 添加AND条件
     */
    andWhere(column: string, operator: SqlOperator, value: any): DeleteQueryBuilder {
        this.query = this.query.where(column, operator, value);
        return this;
    }
}

/**
 * 选择查询构建器
 */
export class SelectQueryBuilder extends QueryBuilder {
    constructor(query: any) {
        super(query);
    }

    /**
     * 选择所有列
     */
    selectAll(): SelectQueryBuilder {
        this.query = this.query.selectAll();
        return this;
    }

    /**
     * 选择指定列
     */
    select(columns: string[]): SelectQueryBuilder {
        this.query = this.query.select(columns);
        return this;
    }

    /**
     * 设置WHERE条件
     */
    where(column: string, operator: SqlOperator, value: any): SelectQueryBuilder {
        this.query = this.query.where(column, operator, value);
        return this;
    }

    /**
     * 添加AND条件
     */
    andWhere(column: string, operator: SqlOperator, value: any): SelectQueryBuilder {
        this.query = this.query.where(column, operator, value);
        return this;
    }

    /**
     * 设置ORDER BY
     */
    orderBy(column: string, direction: 'asc' | 'desc' = 'asc'): SelectQueryBuilder {
        this.query = this.query.orderBy(column, direction);
        return this;
    }

    /**
     * 设置LIMIT
     */
    limit(count: number): SelectQueryBuilder {
        this.query = this.query.limit(count);
        return this;
    }

    /**
     * 设置OFFSET
     */
    offset(count: number): SelectQueryBuilder {
        this.query = this.query.offset(count);
        return this;
    }

    /**
     * 设置GROUP BY
     */
    groupBy(columns: string[]): SelectQueryBuilder {
        this.query = this.query.groupBy(columns);
        return this;
    }
}
