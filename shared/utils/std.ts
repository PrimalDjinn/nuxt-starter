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

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number = 200) {
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

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
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

export function toArray<T>(
  items: T | IterableKind<T> | Map<any, any> | undefined
): T extends Map<infer K, infer V> ? [K, V][] : T[] {
  if (!items) return [] as any;

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
export function binarySearch<T>(arr: Array<T>, comparator: Comparator<T>): number;
export function binarySearch<T>(arr: Array<T>, target: SearchTarget<T>): number {
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
