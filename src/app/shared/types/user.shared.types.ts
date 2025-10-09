// 业务侧使用的用户模型（可选字段为 undefined）
export interface UserModel {
    id: string;
    name: string;
    gender?: 'male' | 'female' | 'other';
    birthday?: string; // ISO date string
    email?: string;
    phone?: string;
    created_at?: string;
    updated_at?: string;
}

// 用户表名与字段常量（避免魔法字符串）
export const UserTable = 'users' as const;
export const UserFields = {
    id: 'id',
    name: 'name',
    gender: 'gender',
    birthday: 'birthday',
    email: 'email',
    phone: 'phone',
    created_at: 'created_at',
    updated_at: 'updated_at',
} as const;
export type UserFieldKey = keyof typeof UserFields;


