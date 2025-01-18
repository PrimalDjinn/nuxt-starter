import type { ConsolaInstance } from "consola";

export type MergeTypes<
  TypesArray extends any[],
  Res = {}
> = TypesArray extends [infer Head, ...infer Rem]
  ? MergeTypes<Rem, Res & Head>
  : Res;
export type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };
export type OneOf<
  TypesArray extends any[],
  Res = never,
  AllProperties = MergeTypes<TypesArray>
> = TypesArray extends [infer Head, ...infer Rem]
  ? OneOf<Rem, Res | OnlyFirst<Head, AllProperties>, AllProperties>
  : Res;

declare global {
  namespace NodeJS {
    interface Global {
      log: ConsolaInstance;
    }
  }
}
