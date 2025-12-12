import type { MaybeArray } from "../types/array";
import type { IterableKind } from "../types/iterators";

interface QNode<T> {
  next?: QNode<T>;
  prev?: QNode<T>;
  data: T;
}

export class Queue<T> {
  private head: QNode<T> | null;
  private tail: QNode<T> | null;
  private _length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this._length = 0;
  }

  enqueue(data: T): void {
    const newNode: QNode<T> = { data, next: undefined, prev: undefined };
    if (!this.head) {
      this.head = this.tail = newNode;
      this._length = 1;
      return;
    }

    if (!this.tail) {
      this.tail = this.head;
    }

    newNode.prev = this.tail;
    this.tail.next = newNode;
    this.tail = newNode;
    this._length++;
  }

  dequeue(): T | null {
    if (!this.head) {
      return null;
    }

    const data = this.head.data;
    this.head = this.head.next || null;

    if (this.head) {
      this.head.prev = undefined;
    } else {
      this.tail = null;
    }
    if (this._length > 0) {
      this._length--;
    }

    return data;
  }

  get length(): number {
    return this._length;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 200
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastResult: ReturnType<T>;

  return (...args: Parameters<T>): ReturnType<T> => {
    lastArgs = args;
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      if (lastArgs) {
        lastResult = func(...lastArgs);
      }
    }, delay);

    return lastResult;
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
) {
  let lastCall = 0;
  let lastResult: ReturnType<T>;
  return (...args: Parameters<T>): ReturnType<T> => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      lastResult = func(...args);
    }
    return lastResult;
  };
}

export function toNumber(n: any) {
  if (!n) return 0;
  if (typeof n === "number") return n;
  try {
    let num = Number(n);
    if (Number.isNaN(num)) {
      num = parseInt(n);
    }

    if (isNaN(num)) {
      console.error("encountered a NaN");
      num = 0;
    }

    return num;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

export function toFloat(n: any) {
  if (!n) return 0.0;
  if (typeof n === "number") return n;
  try {
    let num = Number(n);
    if (Number.isNaN(num)) {
      num = parseFloat(n);
    }

    if (isNaN(num)) {
      console.warn("encountered a NaN", n);
      num = 0;
    }

    return num;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

export function toLocaleFloat(n: any, locale?: Intl.LocalesArgument) {
  const num = toFloat(n);
  return num.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function toLocaleNumber(n: any, locale?: Intl.LocalesArgument) {
  const num = toNumber(n);
  return num.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function isFunction<T extends JSFunction>(param: any): param is T {
  if (typeof param === "function") {
    return true;
  }
  return false;
}

/**
 * Generates a random integer within the specified range (inclusive).
 *
 * @param n The upper or lower bound of the range.
 * If n is positive, the range is [0, n].
 * If n is negative, the range is [n, 0].
 * @returns A random integer within the determined range.
 */
export function generateNumberInRange(n: number): number {
  if (n === 0) {
    return 0;
  }

  const min = Math.min(0, n);
  const max = Math.max(0, n);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isIterable<T = any>(obj: unknown): obj is Iterable<T> {
  return obj != null && typeof (obj as any)[Symbol.iterator] === "function";
}

export function isAsyncIterable<T = any>(
  obj: unknown
): obj is AsyncIterable<T> {
  return (
    obj != null && typeof (obj as any)[Symbol.asyncIterator] === "function"
  );
}

export interface Peek {
  <T>(item?: T[]): T | undefined;
  <T>(item?: Set<T>): T | undefined;
  <K, V>(item?: Map<K, V>): V | undefined;
  <TGen extends Generator<any, any, any>>(item?: TGen):
    | GeneratorValue<TGen>
    | undefined;
  <TGen extends AsyncGenerator<any, any, any>>(item?: TGen): Promise<
    GeneratorValue<TGen> | undefined
  >;
  <T>(item?: MaybeArray<T>): UnArray<T> | undefined;
}

export const peek = ((item: any) => {
  if (Array.isArray(item)) {
    return item.at(0);
  }

  if (item instanceof Map || item instanceof Set) {
    return item.values().next().value;
  }

  if (isGenerator(item) || isAsyncGenerator(item)) {
    const nextResult = item.next();

    const isNextPromise = isPromise(nextResult);
    const first = isNextPromise
      ? nextResult.then((r) => r.value)
      : nextResult.value;

    let usedFirst = false;
    const originalNext = item.next.bind(item);

    // @ts-ignore
    item.next = function (...args: any[]) {
      if (!usedFirst) {
        usedFirst = true;
        return isNextPromise
          ? Promise.resolve({ value: first, done: false })
          : { value: first, done: false };
      }
      // @ts-ignore
      return originalNext(...args);
    };

    return first;
  }

  if (typeof item !== "string" && isIterable(item)) {
    for (const first of item) {
      return first;
    }
  }

  if (typeof item === "object") {
    const next = values(item).next();
    if (isPromise(next)) {
      return next.then((r) => r.value);
    }
    return next.value;
  }

  return item;
}) as Peek;

export interface Take {
  <T>(item: T[], n: number): T[];
  <T>(item: Set<T>, n: number): T[];
  <K, V>(item: Map<K, V>, n: number): V[];
  <TGen extends Generator<any, any, any>>(
    item: TGen,
    n: number
  ): GeneratorValue<TGen>[];
  <TGen extends AsyncGenerator<any, any, any>>(item: TGen, n: number): Promise<
    GeneratorValue<TGen>[]
  >;
  <T>(item: MaybeArray<T>, n: number): T[];
}
export const take = ((item: any, n: number) => {
  if (n <= 0) return [];

  // Arrays
  if (Array.isArray(item)) {
    return item.slice(0, n);
  }

  // Sets and Maps
  if (item instanceof Set) {
    return Array.from(item).slice(0, n);
  }
  if (item instanceof Map) {
    return Array.from(item.values()).slice(0, n);
  }

  // Sync Generator
  if (isGenerator(item)) {
    const result: any[] = [];
    for (let i = 0; i < n; i++) {
      const next = item.next();
      if (next.done) break;
      result.push(next.value);
    }
    return result;
  }

  // Async Generator
  if (isAsyncGenerator(item)) {
    return (async () => {
      const result: any[] = [];
      for await (const value of item) {
        result.push(value);
        if (result.length >= n) break;
      }
      return result;
    })();
  }

  // Iterables
  if (typeof item !== "string" && isIterable(item)) {
    return Array.from(item).slice(0, n);
  }

  // Primitive or Object
  if (typeof item === "object" && item !== null) {
    return Object.values(item).slice(0, n);
  }

  // Fallback for non-iterables
  return [item];
}) as Take;

export function toArray<T extends Map<any, any>>(map: T | None): MapEntries<T>;
export function toArray<T extends Set<any>>(set: T | None): SetItem<T>[];
export function toArray<T>(items: T | IterableKind<T> | None): T[];
export function toArray(items: any) {
  if (!items) return [] as any;

  if (typeof items === "string") {
    return [items] as any;
  }

  if (Array.isArray(items)) {
    return items as any;
  }

  if (isGenerator(items)) {
    return collectFromGenerator(items) as any;
  }

  if (isIterable(items)) {
    return Array.from(items as any) as any;
  }

  return [items] as any;
}

type Operation = "<" | ">" | "=";
type Comparator<T> = (item: T, operation: Operation) => boolean;
type SearchTarget<T> = OneOf<[T, Comparator<T>]>;

export function binarySearch<T>(arr: Array<T>, target: T): number;
export function binarySearch<T>(
  arr: Array<T>,
  comparator: Comparator<T>
): number;
export function binarySearch<T>(
  arr: Array<T>,
  target: SearchTarget<T>
): number {
  let low = 0;
  let high = arr.length - 1;

  const isComparator = typeof target === "function";

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = arr[mid];
    if (!midVal) {
      return -1;
    }

    if (isComparator) {
      if (target(midVal, "=")) {
        return mid;
      } else if (target(midVal, "<")) {
        low = mid + 1;
        continue;
      } else if (target(midVal, ">")) {
        high = mid - 1;
        continue;
      } else {
        console.warn("Invalid comparator function");
        return -1;
      }
    } else {
      if (midVal === target) {
        return mid;
      }

      if (midVal < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  }

  return -1;
}

export type None = undefined | null;
export function isNone(v: any): v is undefined | null {
  return v === undefined || v === null;
}

export async function settle<T extends readonly unknown[]>(
  promises: readonly [...{ [K in keyof T]: Promise<T[K]> }]
): Promise<{ [K in keyof T]: T[K] | undefined }> {
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      const log = (globalThis as any).consola || console;
      log.error(`Promise at index ${index} failed:`, result.reason);
      console.error("An error occured: " + result.reason);
      return undefined;
    }
  }) as { [K in keyof T]: T[K] | undefined };
}

/**
 * Safe wrapper for Promise.race with a local shim if it's not available.
 */
export async function race<T extends readonly unknown[]>(
  promises: readonly [...{ [K in keyof T]: Promise<T[K]> }]
): Promise<T[number]> {
  if (promises.length === 0) {
    throw new Error("Promise.race called with no promises");
  }

  const log = (globalThis as any).consola || console;
  const raceShim = async (
    promises: readonly [...{ [K in keyof T]: Promise<T[K]> }]
  ): Promise<T[number]> => {
    return new Promise((resolve, reject) => {
      let settled = false;

      for (const p of promises) {
        p.then(
          (value) => {
            if (!settled) {
              settled = true;
              resolve(value);
            }
          },
          (error) => {
            if (!settled) {
              settled = true;
              reject(error);
            }
          }
        );
      }
    });
  };

  try {
    const raceFn =
      typeof Promise.race === "function"
        ? Promise.race.bind(Promise)
        : raceShim;
    return await raceFn(promises);
  } catch (error) {
    log.error("Promise.race failed:", error);
    if ((globalThis as any).$alert?.error) {
      (globalThis as any).$alert.error(
        "An error occurred: " + (error as Error).message
      );
    }

    throw error;
  }
}

type ExtractValue<T> = T extends Map<any, infer V>
  ? V
  : T extends Set<infer V>
  ? V
  : T extends (infer V)[]
  ? V
  : T extends AsyncGenerator<infer V>
  ? V
  : T extends AsyncIterator<infer V>
  ? V
  : T extends AsyncIterable<infer V>
  ? V
  : T extends Generator<infer V>
  ? V
  : T extends Iterator<infer V>
  ? V
  : T extends Iterable<infer V>
  ? V
  : T extends object
  ? T[keyof T]
  : never;

type ExtractKey<T> = T extends Map<infer K, any>
  ? K
  : T extends Set<infer V>
  ? V
  : T extends any[]
  ? number
  : T extends object
  ? keyof T
  : never;

type ExtractEntry<T> = T extends Map<infer K, infer V>
  ? [K, V]
  : T extends Set<infer V>
  ? [V, V]
  : T extends (infer V)[]
  ? [number, V]
  : T extends AsyncGenerator<infer V>
  ? [number, V]
  : T extends AsyncIterator<infer V>
  ? [number, V]
  : T extends AsyncIterable<infer V>
  ? [number, V]
  : T extends Generator<infer V>
  ? [number, V]
  : T extends Iterator<infer V>
  ? [number, V]
  : T extends Iterable<infer V>
  ? [number, V]
  : T extends object
  ? [keyof T, T[keyof T]]
  : never;

type ReturnGenerator<T> = T extends
  | AsyncGenerator<any>
  | AsyncIterator<any>
  | AsyncIterable<any>
  ? AsyncGenerator<ExtractValue<T>>
  : Generator<ExtractValue<T>>;

type ReturnGeneratorEntry<T> = T extends
  | AsyncGenerator<any>
  | AsyncIterator<any>
  | AsyncIterable<any>
  ? AsyncGenerator<ExtractEntry<T>>
  : Generator<ExtractEntry<T>>;

type ExtractPeekValue<T> = T extends (infer V)[]
  ? V
  : T extends Set<infer V>
  ? V
  : T extends Map<any, infer V>
  ? V
  : T extends Generator<infer V, any, any>
  ? V
  : T extends AsyncGenerator<infer V, any, any>
  ? V
  : T extends Iterator<infer V>
  ? V
  : T extends AsyncIterator<infer V>
  ? V
  : T extends Iterable<infer V>
  ? V
  : T extends AsyncIterable<infer V>
  ? V
  : T extends object
  ? T[keyof T]
  : T;

type PeekReturn<T> = T extends
  | AsyncGenerator<any, any, any>
  | AsyncIterator<any>
  | AsyncIterable<any>
  ? Promise<ExtractPeekValue<T> | undefined>
  : ExtractPeekValue<T> | undefined;

export interface KeysFunc {
  <T>(obj: T | None, warn?: boolean): Generator<ExtractKey<T>>;
}

export interface EntriesFunc {
  <T>(obj: T | None, warn?: boolean): ReturnGeneratorEntry<T>;
}

export interface ValuesFunc {
  <T>(obj: T | None, warn?: boolean): ReturnGenerator<T>;
}

export interface Peek {
  <T>(item?: T): PeekReturn<T>;
}

export const keys: KeysFunc = function* <T>(
  obj: T | None,
  warn = true
): Generator<any> {
  if (!obj) {
    return;
  }

  if (obj instanceof Map) {
    yield* obj.keys();
    return;
  }

  if (obj instanceof Set) {
    yield* obj.keys();
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      yield i;
    }
    return;
  }

  if (typeof obj === "string") {
    yield obj;
    return;
  }

  if (typeof obj !== "object") {
    if (warn) console.warn("None object passed to function.", obj);
    return;
  }

  if (isGenerator(obj) || isAsyncGenerator(obj)) {
    console.error("Generator passed to function.", obj);
    return;
  }

  for (const key in obj) {
    yield key;
  }
};

export const entries: EntriesFunc = function* <T>(
  obj: T | None,
  warn = true
): Generator<any> | AsyncGenerator<any> {
  if (obj instanceof Map) {
    yield* obj.entries();
    return;
  }

  if (obj instanceof Set) {
    yield* obj.entries();
    return;
  }

  if (isAsyncGenerator(obj)) {
    const gen = async function* () {
      let index = 0;
      for await (const value of obj) {
        yield [index++, value] as [number, any];
      }
    };
    return gen() as any;
  }

  if (isAsyncIterable(obj)) {
    const gen = async function* () {
      let index = 0;
      for await (const value of obj) {
        yield [index++, value] as [number, any];
      }
    };
    return gen() as any;
  }

  if (isGenerator(obj)) {
    let index = 0;
    for (const value of obj) {
      yield [index++, value];
    }
    return;
  }

  if (isIterable(obj) && !Array.isArray(obj) && typeof obj !== "string") {
    let index = 0;
    for (const value of obj) {
      yield [index++, value];
    }
    return;
  }

  for (const key of keys(obj, warn)) {
    yield [key, (obj as any)[key]];
  }
} as any;

export const values: ValuesFunc = function* <T>(
  obj: T | None,
  warn = true
): Generator<any> | AsyncGenerator<any> {
  if (obj instanceof Map) {
    yield* obj.values();
    return;
  }

  if (obj instanceof Set) {
    yield* obj.values();
    return;
  }

  if (isAsyncGenerator(obj)) {
    const gen = async function* () {
      for await (const value of obj) {
        yield value;
      }
    };
    return gen() as any;
  }

  if (isAsyncIterable(obj)) {
    const gen = async function* () {
      for await (const value of obj) {
        yield value;
      }
    };
    return gen() as any;
  }

  if (isGenerator(obj)) {
    for (const value of obj) {
      yield value;
    }
    return;
  }

  if (isIterable(obj) && !Array.isArray(obj) && typeof obj !== "string") {
    for (const value of obj) {
      yield value;
    }
    return;
  }

  for (const key of keys(obj, warn)) {
    yield (obj as any)[key];
  }
} as any;

export function assertTruthy<T>(
  value: T,
  message?: string
): asserts value is NonNullable<T> {
  if (!value) {
    throw new Error(
      message || "Expected value to be truthy, but got falsy value."
    );
  }
}

export function makeThenable<T, S extends object>(
  source: S,
  promise: Promise<T>
) {
  const thenable = new Proxy(source as S & Promise<T>, {
    get(target, prop, receiver) {
      if (prop in promise) {
        // @ts-ignore
        const value = promise[prop];
        return typeof value === "function" ? value.bind(promise) : value;
      }
      return Reflect.get(target, prop, receiver);
    },
  });
  return thenable as S & Promise<T>;
}
