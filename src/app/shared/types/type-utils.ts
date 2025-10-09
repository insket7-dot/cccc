// 通用类型工具：将可选字段(undefined)映射为可空(null)
export type NullifyOptionals<T> = { [K in keyof T]-?: Exclude<T[K], undefined> | null };


