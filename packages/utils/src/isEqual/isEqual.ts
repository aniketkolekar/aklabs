/**
 * Performs a deep equality comparison between two values.
 *
 * @description
 * Recursively compares two values for structural equality. Returns `true` only if
 * values are deeply identical. Handles primitives, objects, arrays, Date, RegExp,
 * Map, Set, and circular references. Unlike strict equality (`===`), this function
 * treats `NaN` as equal to `NaN` and compares object properties regardless of order.
 *
 * Special cases:
 * - `NaN` equals `NaN` (unlike `===`)
 * - Object property order does not matter
 * - Handles circular references without throwing
 * - Different class instances are not equal even with same properties
 *
 * @param a - The first value to compare
 * @param b - The second value to compare
 * @returns `true` if values are deeply equal, `false` otherwise
 *
 * @example
 * ```ts
 * // Primitives and special values
 * isEqual(1, 1); // true
 * isEqual(NaN, NaN); // true (unlike === which returns false)
 * isEqual(null, undefined); // false
 * ```
 *
 * @example
 * ```ts
 * // Objects and arrays
 * isEqual({ a: 1, b: 2 }, { b: 2, a: 1 }); // true (order doesn't matter)
 * isEqual([1, 2, 3], [1, 2, 3]); // true
 * isEqual({ a: { b: 1 } }, { a: { b: 1 } }); // true (deep equality)
 * ```
 *
 * @example
 * ```ts
 * // Special types
 * const date1 = new Date('2024-01-01');
 * const date2 = new Date('2024-01-01');
 * isEqual(date1, date2); // true
 *
 * isEqual(/test/gi, /test/gi); // true
 * isEqual(new Map([['a', 1]]), new Map([['a', 1]])); // true
 * ```
 */
export function isEqual(a: unknown, b: unknown): boolean {
  // Use WeakMap to track circular references
  const cache = new WeakMap<object, object>();

  function deepEqual(val1: unknown, val2: unknown): boolean {
    // Handle same reference
    if (val1 === val2) {
      return true;
    }

    // Handle NaN
    if (
      typeof val1 === 'number' &&
      typeof val2 === 'number' &&
      Number.isNaN(val1) &&
      Number.isNaN(val2)
    ) {
      return true;
    }

    // Handle null and undefined
    if (val1 === null || val2 === null || val1 === undefined || val2 === undefined) {
      return val1 === val2;
    }

    // Handle different types
    if (typeof val1 !== typeof val2) {
      return false;
    }

    // Handle primitives
    if (typeof val1 !== 'object' || typeof val2 !== 'object') {
      return false;
    }

    // Check for circular references
    if (cache.has(val1 as object)) {
      return cache.get(val1 as object) === val2;
    }

    cache.set(val1 as object, val2 as object);

    // Handle Date
    if (val1 instanceof Date && val2 instanceof Date) {
      return val1.getTime() === val2.getTime();
    }

    // Handle RegExp
    if (val1 instanceof RegExp && val2 instanceof RegExp) {
      return val1.source === val2.source && val1.flags === val2.flags;
    }

    // Handle Map
    if (val1 instanceof Map && val2 instanceof Map) {
      if (val1.size !== val2.size) {
        return false;
      }

      for (const [key, value] of val1) {
        if (!val2.has(key) || !deepEqual(value, val2.get(key))) {
          return false;
        }
      }

      return true;
    }

    // Handle Set
    if (val1 instanceof Set && val2 instanceof Set) {
      if (val1.size !== val2.size) {
        return false;
      }

      for (const value of val1) {
        if (typeof value !== 'object' || value === null) {
          // Primitives: O(1) lookup
          if (!val2.has(value)) {
            return false;
          }
        } else {
          // Objects: fall back to deep comparison O(n)
          let found = false;
          for (const value2 of val2) {
            if (deepEqual(value, value2)) {
              found = true;
              break;
            }
          }
          if (!found) {
            return false;
          }
        }
      }

      return true;
    }

    // Handle Array
    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (val1.length !== val2.length) {
        return false;
      }

      for (let i = 0; i < val1.length; i++) {
        if (!deepEqual(val1[i], val2[i])) {
          return false;
        }
      }

      return true;
    }

    // Handle different constructors (class instances)
    if (val1.constructor !== val2.constructor) {
      return false;
    }

    // Handle plain objects
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!Object.prototype.hasOwnProperty.call(val2, key)) {
        return false;
      }

      if (
        !deepEqual((val1 as Record<string, unknown>)[key], (val2 as Record<string, unknown>)[key])
      ) {
        return false;
      }
    }

    return true;
  }

  return deepEqual(a, b);
}
