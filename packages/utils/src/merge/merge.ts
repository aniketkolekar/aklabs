/**
 * Deep merges source objects into a target object.
 *
 * @description
 * Recursively merges properties from one or more source objects into a target object.
 * Source properties overwrite target properties at every depth level. Arrays are
 * replaced entirely, not merged element-by-element. The target object is mutated
 * and returned. Source objects are not mutated.
 *
 * Special handling:
 * - `undefined` values in sources do NOT overwrite defined values in target
 * - `null` values in sources DO overwrite values in target
 * - Arrays are replaced, not merged: `merge({a:[1]}, {a:[2,3]})` → `{a:[2,3]}`
 * - Only plain objects are merged recursively; other object types are replaced
 *
 * **TypeScript note:** When merging 2+ sources, the return type is `T & S[number]`
 * which represents a union of source types, not their intersection. TypeScript
 * cannot precisely type variadic merges. The runtime behavior is correct - all
 * properties from all sources are merged - but type inference may require assertion
 * for 2+ sources.
 *
 * @param target - The target object to merge into (will be mutated)
 * @param sources - One or more source objects to merge from
 * @returns The mutated target object with all sources merged
 *
 * @example
 * ```ts
 * // Basic merge
 * const target = { a: 1, b: 2 };
 * const source = { b: 3, c: 4 };
 * const result = merge(target, source);
 *
 * console.log(result); // { a: 1, b: 3, c: 4 }
 * console.log(result === target); // true (target is mutated)
 * ```
 *
 * @example
 * ```ts
 * // Deep merge with nested objects
 * const target = { user: { name: 'Alice', age: 30 } };
 * const source = { user: { age: 31, city: 'NYC' } };
 * const result = merge(target, source);
 *
 * console.log(result.user); // { name: 'Alice', age: 31, city: 'NYC' }
 * ```
 *
 * @example
 * ```ts
 * // Multiple sources - later sources override earlier ones
 * const target = { a: 1 };
 * const result = merge(target, { a: 2, b: 2 }, { a: 3, c: 3 });
 *
 * console.log(result); // { a: 3, b: 2, c: 3 }
 * ```
 */
export function merge<T extends object, S extends object[]>(
  target: T,
  ...sources: S
): T & S[number] {
  function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
  }

  function isSafeKey(key: string): boolean {
    return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
  }

  function mergeObjects(dest: Record<string, unknown>, src: Record<string, unknown>): void {
    Object.keys(src).forEach((key) => {
      if (!isSafeKey(key)) {
        return;
      }

      const srcValue = src[key];

      // undefined in source does not overwrite target
      if (srcValue === undefined) {
        return;
      }

      const destValue = dest[key];

      // If both are plain objects, merge recursively
      if (isPlainObject(destValue) && isPlainObject(srcValue)) {
        mergeObjects(destValue, srcValue);
      } else {
        // Otherwise, replace (including arrays, null, primitives, etc.)
        dest[key] = srcValue;
      }
    });
  }

  sources.forEach((source) => {
    if (source && typeof source === 'object') {
      mergeObjects(target as Record<string, unknown>, source as Record<string, unknown>);
    }
  });

  return target as T & S[number];
}
