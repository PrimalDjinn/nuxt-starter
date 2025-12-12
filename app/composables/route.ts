export function useRouteQuery(key: string, array: true): WritableComputedRef<string[]>;
export function useRouteQuery(key: string): WritableComputedRef<string | undefined>;
export function useRouteQuery(key: string, array = false) {
  const route = useRoute();
  return computed({
    get() {
      const value = route.query[key];
      if (!array) {
        if (Array.isArray(value)) {
          return value.at(-1)?.toString();
        }

        return value?.toString();
      } else {
        return Array.isArray(value) ? value.map((v) => v?.toString()) : [value?.toString()];
      }
    },
    set(value) {
      const router = useRouter();

      if (value === undefined || value === null) {
        router.push({
          query: {
            ...route.query,
            [key]: undefined,
          },
        });
        return;
      }

      if (Array.isArray(value)) {
        if (value.length) {
          value.forEach((v) => {
            router.push({
              query: {
                ...route.query,
                [key]: v,
              },
            });
          });
          return;
        }

        router.push({
          query: {
            ...route.query,
            [key]: undefined,
          },
        });
        return;
      }

      router.push({
        query: {
          ...route.query,
          [key]: value,
        },
      });
    },
  });
}

export function useRouteParam(key: string, array: true): ComputedRef<string[]>;
export function useRouteParam(key: string): ComputedRef<string | undefined>;
export function useRouteParam(key: string, array?: true) {
  const route = useRoute();
  return computed(() => {
    const value = route.params[key];
    if (!array) {
      if (Array.isArray(value)) {
        return value.at(-1);
      }

      return value;
    } else {
      return Array.isArray(value) ? value : [value];
    }
  });
}


/**
 * import type { JSFunction, OneOf } from "types";
import { z, safeParse } from "zod/v4-mini";
import type { DeepPartial } from "types";

type ZodSafeParseResult<T> =
  | { success: true; data: T; error: undefined }
  | { success: false; error: z.core.$ZodError; data: undefined };

type FlattenedError = ReturnType<typeof z.flattenError>;
type PrettifiedError = ReturnType<typeof z.prettifyError>;

type ValidateParams = Partial<z.core.ParseContext<z.core.$ZodIssue>> &
  OneOf<[{ prettifyError?: boolean; breaks?: boolean }, { flattenError?: boolean }]>;

export type ZInfer<T extends z.core.$ZodShape> = {
  [K in keyof T]: T[K] extends z.core.$ZodType<any, any> ? z.infer<T[K]> : never;
};

function replaceNewlinesWithSymbol(text: string) {
  return text.replace(/\n/g, "⏎\u00A0");
}

export function validate<T extends z.core.$ZodShape>(
  schema: z.core.$ZodObject<T>,
  data: unknown,
  params: ValidateParams & {
    flattenError: true;
  },
): { success: false; error: FlattenedError } | { success: true; data: z.infer<typeof schema> };
export function validate<T>(
  schema: T,
  data: unknown,
  params: ValidateParams & {
    prettifyError: true;
    breaks?: boolean;
  },
): { success: false; error: PrettifiedError } | { success: true; data: z.infer<typeof schema> };
export function validate<T>(
  schema: T,
  data: unknown,
  params?: ValidateParams,
): ZodSafeParseResult<z.infer<typeof schema>>;
export function validate<T extends z.core.$ZodShape>(
  schema: z.core.$ZodObject<T>,
  data: unknown,
  params?: ValidateParams,
) {
  const result = safeParse(schema, data, params) as any;
  if (result.error) {
    if (params?.flattenError) {
      result.error = z.flattenError(result.error);
    } else if (params?.prettifyError) {
      result.error = z.prettifyError(result.error);

      if (params.breaks) {
        result.error = replaceNewlinesWithSymbol(result.error);
      }
    }
  }
  return result;
}

export default function <
  T extends z.core.$ZodShape,
  S extends z.core.$ZodObject<T>,
  O = Partial<z.infer<S>>,
  D = DeepPartial<O>,
>(schema: S, initial?: OneOf<[D, JSFunction<D>]>) {
  const blank = {} as Partial<O>;
  if (initial) {
    Object.assign(blank, typeof initial === "function" ? initial() : initial);
  }

  const data = reactive(blank as Partial<O> & D);
  return {
    data,
    validate(params?: ValidateParams) {
      return validate(schema, data, params);
    },
    reinit(new_initial?: D) {
      resetReactive(data);
      if (new_initial) {
        Object.assign(data, new_initial);
        return;
      }

      if (initial) {
        Object.assign(data, typeof initial === "function" ? initial() : initial);
        return;
      }
    },
  };
}

 */