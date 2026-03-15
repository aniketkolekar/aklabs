/**
 * Creates a new object with the specified keys removed from the source object.
 *
 * @description
 * Returns a new object containing all properties from the source object except
 * those whose keys are specified in the `keys` array. The source object is not
 * mutated. Keys that do not exist on the source object are silently ignored.
 * The return type is precisely typed as `Omit<T, K>`, preserving the exact types
 * and optionality of all non-omitted properties.
 *
 * @param obj - The source object to omit properties from
 * @param keys - Array of keys to omit from the source object
 * @returns A new object with the specified properties removed
 *
 * @example
 * ```ts
 * // Omit single property
 * const user = { id: 1, name: 'Alice', password: 'secret' };
 * const publicUser = omit(user, ['password']);
 * // Result: { id: 1, name: 'Alice' }
 * ```
 *
 * @example
 * ```ts
 * // Omit multiple properties
 * const data = { id: 1, name: 'Test', internal: true, debug: false };
 * const clean = omit(data, ['internal', 'debug']);
 * // Result: { id: 1, name: 'Test' }
 * ```
 *
 * @example
 * ```ts
 * // Non-existent keys are ignored
 * const obj = { a: 1, b: 2 };
 * const result = omit(obj, ['c' as keyof typeof obj]);
 * // Result: { a: 1, b: 2 } (no error, 'c' is ignored)
 * ```
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = {} as Omit<T, K>;
  const keysSet = new Set(keys);

  (Object.keys(obj) as (keyof T)[]).forEach((key) => {
    if (!keysSet.has(key as K)) {
      (result as T)[key] = obj[key];
    }
  });

  return result;
}
