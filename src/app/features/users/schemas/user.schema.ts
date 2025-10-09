import type { NullifyOptionals } from '../../../shared/types/type-utils';
import type { UserModel } from '../../../shared/types/user.shared.types';

// Kysely Schema 接口需求
export type UserRow = NullifyOptionals<UserModel>;

export interface UserDB {
    users: UserRow;
}
