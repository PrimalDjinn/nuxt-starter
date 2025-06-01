export type GeneratorValue<T extends Generator | AsyncGenerator> =
  T extends Generator<infer U>
    ? U
    : T extends AsyncGenerator<infer V>
    ? V
    : never;
export type GeneratorReturn<T extends Generator | AsyncGenerator> =
  T extends Generator<any, infer R, any>
    ? R
    : T extends AsyncGenerator<any, infer R, any>
    ? R
    : never;

export type IterableKind<T = any> = T[] | MapIterator<T> | Generator<T>;
