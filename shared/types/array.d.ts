export type UnArray<T> = T extends Array<infer M> ? M : T;
export type ToArray<T, Y = UnArray<NonNullable<T>>> = Y[];
export type MaybeArray<T> = T | T[];
