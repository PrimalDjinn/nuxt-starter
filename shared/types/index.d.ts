export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type IsOptional<V> = undefined extends V ? true : false;
export type Replace<
  T,
  P extends Keys<T>,
  V
> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? {
        [Key in keyof T]: Key extends K
          ? Replace<T[K], Extract<Rest, Keys<T[K]>>, V>
          : T[Key];
      }
    : T
  : P extends keyof T
  ? IsOptional<V> extends true
    ? Omit<T, P> & { [Key in P]?: V }
    : Omit<T, P> & { [Key in P]: V }
  : T;

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B;

export type NonReadonlyKeys<T> = {
  [K in keyof T]: IfEquals<{ [P in K]: T[K] }, { -readonly [P in K]: T[K] }, K>;
}[keyof T];

export type StripReadOnly<T> = Pick<T, NonReadonlyKeys<T>>;
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
