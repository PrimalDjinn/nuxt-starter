export type MapValueType<T> = T extends Map<any, infer V> ? V : never;
export type MapKeyType<T> = T extends Map<infer K, any> ? K : never;
export type MapEntries<T extends Map<any, any>> = Array<
  [MapKeyType<T>, MapValueType<T>]
>;
export type MapEntry<T extends Map<any, any>> = MapEntries<T>[number];
export type SetItem<T> = T extends Set<infer V> ? V : never;
