/**
 * This function is used to convert a string to a truthy or falsy value.
 *
 * The truthy values are: `true`, `false` or the string itself.
 * The falsy values are: `null` and `undefined`.
 *
 * It takes care of trimming the string and converting it to lowercase.
 * It returns null, true, false, undefined or the original value.
 *
 *
 * @example
 *
 * Boolish("true") // true
 *
 * Boolish("FALSE") // false
 *
 * Boolish("null") // null
 *
 * Boolish("undefined") // undefined
 *
 * Boolish("hello") // "hello"
 *
 * Boolish("") // null
 *
 * Boolish(" ") // null
 *
 * Boolish("TRUE") // true
 *
 */
type MaybeValue<T> = T extends undefined
  ? null | boolean | string | undefined | any
  : T;
export function Boolish<T = undefined>(val: any): MaybeValue<T> {
  if (typeof val !== "string") return val;
  val = val.trim().toLowerCase();
  switch (true) {
    case val === "":
    case val === "null":
      return null as MaybeValue<T>;
    case val === "true":
      return true as MaybeValue<T>;
    case val === "false":
      return false as MaybeValue<T>;
    case val === "undefined":
      return undefined as MaybeValue<T>;
    default:
      return val;
  }
}

/**
 * This function is used to check if an object has a list of properties.
 *
 * It returns true if the object has all the properties, false otherwise.
 *
 * If `allowNullish` is set to true, it will also check if the property is truthy.
 *
 * @example
 *
 * const obj = {name: "John", age: 20, address: null}
 *
 * hasOwnProperties(obj, ["name", "age"]) // true
 *
 * hasOwnProperties(obj, ["name", "age", "sex"]) // false
 *
 * hasOwnProperties(obj, ["name", "age", "address"], false) // false
 */
export function hasOwnProperties<T extends Object>(
  obj: T | any,
  properties: (keyof T)[],
  allowNullish = true
): obj is T {
  if (!obj) return false;
  if (typeof obj !== "object") return false;
  return properties.every((property) => {
    if (allowNullish) return Object.prototype.hasOwnProperty.call(obj, property);
    return Object.prototype.hasOwnProperty.call(obj, property) && Boolish<T>(obj[property]);
  });
}

type KeyValue<T> = { [K in keyof T]: T[K] };
type FinderFunction<T> = (arg: T, index: number, arr: T[]) => boolean;
type Finder<T> = T extends object ? Partial<KeyValue<T>> | boolean : undefined;

// TODO: Test implementation
/**
 * Deletes items from an array based on various matching criteria.
 * Modifies the original array and returns the modified array.
 *
 * @template T - The type of elements in the array
 * @param {T[]} arr - The input array to delete items from
 * @param {T | Finder<T> | FinderFunction<T>} [target] - The matching criteria:
 *   - If omitted: Clears the entire array
 *   - If primitive value: Matches by strict equality
 *   - If object: Matches by comparing object properties
 *   - If function: Uses custom matching logic
 * @param {Array<keyof T> | boolean} [comp] - Comparison options for object matching:
 *   - If array of keys: Only compares specified properties
 *   - If true: Performs deep equality comparison
 *   - If omitted/false: Compares all properties with shallow equality
 * @returns {T[]} The modified input array with matching items removed
 *
 * @example
 * // Delete by value
 * const numbers = [1, 2, 3, 2, 4];
 * deleteArrayItems(numbers, 2);
 * console.log(numbers); // [1, 3, 4]
 *
 * @example
 * // Delete by object properties
 * const users = [
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' },
 *   { id: 3, name: 'John' }
 * ];
 * deleteArrayItems(users, { name: 'John' });
 * console.log(users); // [{ id: 2, name: 'Jane' }]
 *
 * @example
 * // Delete using custom function
 * const numbers = [1, 2, 3, 4, 5];
 * deleteArrayItems(numbers, (n) => n % 2 === 0);
 * console.log(numbers); // [1, 3, 5]
 *
 * @example
 * // Delete by specific properties
 * const users = [
 *   { id: 1, name: 'John', age: 30 },
 *   { id: 2, name: 'Jane', age: 25 },
 *   { id: 3, name: 'John', age: 35 }
 * ];
 * deleteArrayItems(users, { name: 'John', age: 30 }, ['name', 'age']);
 * console.log(users); // [{ id: 2, name: 'Jane', age: 25 }, { id: 3, name: 'John', age: 35 }]
 *
 * @example
 * // Clear array
 * const numbers = [1, 2, 3];
 * deleteArrayItems(numbers);
 * console.log(numbers); // []
 */
export function deleteArrayItems<T>(
  arr: T[],
  target?: Finder<T> | FinderFunction<T>
): T[];
export function deleteArrayItems<T extends object>(
  arr: T[],
  target: Partial<KeyValue<T>>,
  comp?: Array<keyof T> | boolean
): T[];
export function deleteArrayItems<T>(
  arr: T[],
  target?: T | Finder<T> | FinderFunction<T>,
  comp?: Array<keyof T> | boolean
): T[] {
  if (!arr || !arr.length) return arr ? arr : [];
  let getIndex: () => number;

  switch (true) {
    case !target:
      arr.length = 0;
      return arr;
    case typeof target === "object":
      if (Array.isArray(comp)) {
        getIndex = () =>
          arr.findIndex((item) => {
            for (const key of comp) {
              if (item[key] !== (target as Partial<T>)[key]) {
                return false;
              }
              return true;
            }
          });
      } else if (comp === true) {
        const deepEqual = function <T extends object>(
          obj1: T,
          obj2: T
        ): boolean {
          if (obj1 === obj2) return true;

          if (
            typeof obj1 !== "object" ||
            obj1 === null ||
            typeof obj2 !== "object" ||
            obj2 === null
          ) {
            return false;
          }

          const keys1 = Object.keys(obj1).sort();
          const keys2 = Object.keys(obj2).sort();

          if (keys1.length !== keys2.length) return false;

          for (const key of keys1) {
            if (!keys2.includes(key)) return false;
            // @ts-expect-error
            if (!deepEqual(obj1[key as keyof T], obj2[key as keyof T]))
              return false;
          }

          return true;
        };
        getIndex = () =>
          arr.findIndex((item) => deepEqual(item as object, target));
      } else {
        getIndex = () =>
          arr.findIndex((item) => {
            for (const key in target as T) {
              if (item[key] !== (target as Partial<T>)[key]) {
                return false;
              }
            }
            return true;
          });
      }
      break;
    case typeof target === "function":
      getIndex = () => arr.findIndex(target as FinderFunction<T>);
      break;
    default:
      getIndex = () => arr.indexOf(target as T);
      break;
  }

  let index;
  // TODO: Improve, stop re-looping the list on each iteration, but collect the indexes that match the finding criteria
  while ((index = getIndex()) !== -1) {
    arr.splice(index, 1);
  }

  return arr;
}


export function isEmpty<T extends Object>(obj: T | any): obj is T {
  if (!obj) return true;
  if (typeof obj !== "object") return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (obj instanceof Map) return obj.size === 0;
  if (obj instanceof Set) return obj.size === 0;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }

  return true;
}
