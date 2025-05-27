export type Keys<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? K | `${K}.${Keys<T[K]>}` : never;
    }[keyof T]
  : never;

export type TypeAtKeysPath<T, P> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? TypeAtKeysPath<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

export type Ommit<T, P extends Keys<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? {
        [Key in keyof T as Key extends K ? Key : never]: Ommit<
          T[K],
          Extract<Rest, Keys<T[K]>>
        >;
      } & Omit<T, K>
    : T
  : Omit<T, P>;

export type PPick<T, P extends Keys<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? {
        [Key in K]: PPick<T[K], Extract<Rest, Keys<T[K]>>>;
      }
    : never
  : P extends keyof T
  ? { [Key in P]: T[Key] }
  : never;

export type SmartKeys<T> = (keyof T & string) | (string & {});

export type Values<T> = Prettify<T[keyof T]>;

export type OneOfRecord<T extends Record<string, any>> = {
  [K in keyof T]: {
    [Key in keyof T[K]]: Key extends string
      ? T[K][Key] extends Record<string, any>
        ? OneOfRecord<T[K][Key]>
        : T[K][Key]
      : never;
  };
}[keyof T];

export type Optional<T> = T | undefined;
