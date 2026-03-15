/**
 * Creates a new object with only the specified keys from the source object.
 *
 * @description
 * Returns a new object containing only the properties whose keys are specified
 * in the `keys` array. The source object is not mutated. Keys that do not exist
 * on the source object are silently ignored. The return type is precisely typed
 * as `Pick<T, K>`, preserving the exact types and optionality of each picked property.
 *
 * @param obj - The source object to pick properties from
 * @param keys - Array of keys to pick from the source object
 * @returns A new object containing only the specified properties
 *
 * @example
 * ```ts
 * // Pick single property
 * const user = { id: 1, name: 'Alice', email: 'alice@example.com' };
 * const nameOnly = pick(user, ['name']);
 * // Result: { name: 'Alice' }
 * ```
 *
 * @example
 * ```ts
 * // Pick multiple properties
 * const user = { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 };
 * const publicInfo = pick(user, ['name', 'email']);
 * // Result: { name: 'Alice', email: 'alice@example.com' }
 * ```
 *
 * @example
 * ```ts
 * // Non-existent keys are ignored
 * const obj = { a: 1, b: 2 };
 * const result = pick(obj, ['a', 'c' as keyof typeof obj]);
 * // Result: { a: 1 } (no error, 'c' is ignored)
 * ```
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  });

  return result;
}
