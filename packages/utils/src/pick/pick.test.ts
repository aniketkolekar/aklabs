import { describe, expect, expectTypeOf, it } from 'vitest';

import { pick } from './pick.js';

describe('pick', () => {
  describe('basic functionality', () => {
    it('picks single key', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = pick(obj, ['a']);

      expect(result).toEqual({ a: 1 });
    });

    it('picks multiple keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = pick(obj, ['a', 'c']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('picks all keys - result equals source', () => {
      const obj = { a: 1, b: 2 };
      const result = pick(obj, ['a', 'b']);

      expect(result).toEqual(obj);
      expect(result).not.toBe(obj);
    });

    it('picks no keys - returns empty object', () => {
      const obj = { a: 1, b: 2 };
      const result = pick(obj, []);

      expect(result).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('non-existent key is silently ignored', () => {
      const obj = { a: 1, b: 2 };
      const result = pick(obj, ['a', 'c' as keyof typeof obj]);

      expect(result).toEqual({ a: 1 });
    });

    it('does not mutate source', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const original = { ...obj };

      pick(obj, ['a']);

      expect(obj).toEqual(original);
    });

    it('works with optional properties', () => {
      const obj: { a: number; b?: string } = { a: 1 };
      const result = pick(obj, ['a', 'b']);

      expect(result).toEqual({ a: 1 });
    });

    it('picks defined optional property', () => {
      const obj: { a: number; b?: string } = { a: 1, b: 'test' };
      const result = pick(obj, ['b']);

      expect(result).toEqual({ b: 'test' });
    });
  });

  describe('TypeScript type tests', () => {
    it('return type is exactly Pick<T, K>', () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const user: User = { id: 1, name: 'Alice', email: 'alice@example.com' };
      const result = pick(user, ['name', 'email']);

      expectTypeOf(result).toEqualTypeOf<Pick<User, 'name' | 'email'>>();
    });

    it('accessing non-picked key is a compile error', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = pick(obj, ['a', 'b']);

      expectTypeOf(result).toHaveProperty('a');
      expectTypeOf(result).toHaveProperty('b');

      // @ts-expect-error - 'c' was not picked
      expectTypeOf(result).toHaveProperty('c');
    });

    it('picked properties have correct types', () => {
      interface Data {
        id: number;
        name: string;
        active: boolean;
      }

      const data: Data = { id: 1, name: 'Test', active: true };
      const result = pick(data, ['id', 'active']);

      expectTypeOf(result.id).toEqualTypeOf<number>();
      expectTypeOf(result.active).toEqualTypeOf<boolean>();
    });

    it('preserves optional properties', () => {
      interface Config {
        required: string;
        optional?: number;
      }

      const config: Config = { required: 'value' };
      const result = pick(config, ['optional']);

      expectTypeOf(result).toEqualTypeOf<Pick<Config, 'optional'>>();
      expectTypeOf(result.optional).toEqualTypeOf<number | undefined>();
    });
  });
});
