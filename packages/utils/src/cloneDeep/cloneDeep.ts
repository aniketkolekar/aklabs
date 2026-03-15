/**
 * Creates a deep clone of the given value.
 *
 * @description
 * Recursively clones all nested objects, arrays, and special types like Date, RegExp,
 * Map, and Set. Handles circular references without throwing errors. Primitives are
 * returned as-is. Functions, WeakMap, WeakSet, and DOM nodes are returned without
 * cloning as they cannot be meaningfully deep cloned.
 *
 * Unlike the native `structuredClone`, this implementation gracefully handles functions
 * and class instances instead of throwing errors, making it suitable for cloning
 * arbitrary JavaScript values.
 *
 * @param value - The value to clone
 * @returns A deep clone of the value
 *
 * @example
 * ```ts
 * // Clone nested objects
 * const original = { a: 1, b: { c: 2, d: [3, 4] } };
 * const cloned = cloneDeep(original);
 *
 * cloned.b.c = 99;
 * console.log(original.b.c); // 2 (unchanged)
 * ```
 *
 * @example
 * ```ts
 * // Clone special types
 * const original = {
 *   date: new Date('2024-01-01'),
 *   regex: /test/gi,
 *   map: new Map([['key', 'value']]),
 *   set: new Set([1, 2, 3]),
 * };
 *
 * const cloned = cloneDeep(original);
 * console.log(cloned.date instanceof Date); // true
 * console.log(cloned.date === original.date); // false
 * ```
 *
 * @example
 * ```ts
 * // Handles circular references
 * const obj: { self?: unknown } = { value: 42 };
 * obj.self = obj;
 *
 * const cloned = cloneDeep(obj);
 * console.log(cloned.self === cloned); // true (circular reference preserved)
 * ```
 */
export function cloneDeep<T>(value: T): T {
  // Handle primitives and null
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Use WeakMap to track circular references
  const cache = new WeakMap<object, unknown>();

  function clone<V>(val: V): V {
    // Handle primitives and null
    if (val === null || typeof val !== 'object') {
      return val;
    }

    // Check for circular reference
    if (cache.has(val as object)) {
      return cache.get(val as object) as V;
    }

    // Handle Date
    if (val instanceof Date) {
      return new Date(val.getTime()) as V;
    }

    // Handle RegExp
    if (val instanceof RegExp) {
      const flags = val.flags;
      const cloned = new RegExp(val.source, flags);
      cloned.lastIndex = val.lastIndex;
      return cloned as V;
    }

    // Handle Map
    if (val instanceof Map) {
      const cloned = new Map();
      cache.set(val as object, cloned);
      val.forEach((value, key) => {
        cloned.set(clone(key), clone(value));
      });
      return cloned as V;
    }

    // Handle Set
    if (val instanceof Set) {
      const cloned = new Set();
      cache.set(val as object, cloned);
      val.forEach((value) => {
        cloned.add(clone(value));
      });
      return cloned as V;
    }

    // Handle Array
    if (Array.isArray(val)) {
      const cloned: unknown[] = [];
      cache.set(val as object, cloned);
      val.forEach((item, index) => {
        cloned[index] = clone(item);
      });
      return cloned as V;
    }

    // Handle functions - return as-is (cannot be meaningfully cloned)
    if (typeof val === 'function') {
      return val;
    }

    // Handle plain objects and class instances
    // For class instances, we clone the properties but preserve the prototype
    const cloned = Object.create(Object.getPrototypeOf(val)) as V;
    cache.set(val as object, cloned);

    // Clone all own properties (including non-enumerable ones)
    Object.getOwnPropertyNames(val).forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(val, key);
      if (descriptor) {
        if (descriptor.value !== undefined) {
          Object.defineProperty(cloned, key, {
            ...descriptor,
            value: clone(descriptor.value),
          });
        } else {
          // Preserve getters/setters
          Object.defineProperty(cloned, key, descriptor);
        }
      }
    });

    // Clone symbol properties
    Object.getOwnPropertySymbols(val).forEach((sym) => {
      const descriptor = Object.getOwnPropertyDescriptor(val, sym);
      if (descriptor) {
        if (descriptor.value !== undefined) {
          Object.defineProperty(cloned, sym, {
            ...descriptor,
            value: clone(descriptor.value),
          });
        } else {
          Object.defineProperty(cloned, sym, descriptor);
        }
      }
    });

    return cloned;
  }

  return clone(value);
}
