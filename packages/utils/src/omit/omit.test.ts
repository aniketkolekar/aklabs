import { describe, expect, expectTypeOf, it } from 'vitest';

import { omit } from './omit.js';

describe('omit', () => {
  describe('basic functionality', () => {
    it('omits single key', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = omit(obj, ['b']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('omits multiple keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ['b', 'd']);

      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('omits no keys - result equals source', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, []);

      expect(result).toEqual(obj);
      expect(result).not.toBe(obj);
    });

    it('omits all keys - returns empty object', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, ['a', 'b']);

      expect(result).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('non-existent key is silently ignored', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, ['c' as keyof typeof obj]);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('does not mutate source', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const original = { ...obj };

      omit(obj, ['b']);

      expect(obj).toEqual(original);
    });

    it('works with optional properties', () => {
      const obj: { a: number; b?: string; c: boolean } = { a: 1, c: true };
      const result = omit(obj, ['c']);

      expect(result).toEqual({ a: 1 });
    });

    it('omits defined optional property', () => {
      const obj: { a: number; b?: string } = { a: 1, b: 'test' };
      const result = omit(obj, ['b']);

      expect(result).toEqual({ a: 1 });
    });
  });

  describe('TypeScript type tests', () => {
    it('return type is Omit<T, K>', () => {
      interface User {
        id: number;
        name: string;
        password: string;
      }

      const user: User = { id: 1, name: 'Alice', password: 'secret' };
      const result = omit(user, ['password']);

      expectTypeOf(result).toEqualTypeOf<Omit<User, 'password'>>();
    });

    it('omitted key is not accessible on result type', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = omit(obj, ['b']);

      expectTypeOf(result).toHaveProperty('a');
      expectTypeOf(result).toHaveProperty('c');

      // @ts-expect-error - 'b' was omitted
      expectTypeOf(result).toHaveProperty('b');
    });

    it('retained properties have correct types', () => {
      interface Data {
        id: number;
        name: string;
        active: boolean;
        internal: boolean;
      }

      const data: Data = { id: 1, name: 'Test', active: true, internal: false };
      const result = omit(data, ['internal']);

      expectTypeOf(result.id).toEqualTypeOf<number>();
      expectTypeOf(result.name).toEqualTypeOf<string>();
      expectTypeOf(result.active).toEqualTypeOf<boolean>();
    });

    it('preserves optional properties', () => {
      interface Config {
        required: string;
        optional?: number;
        debug: boolean;
      }

      const config: Config = { required: 'value', debug: true };
      const result = omit(config, ['debug']);

      expectTypeOf(result).toEqualTypeOf<Omit<Config, 'debug'>>();
      expectTypeOf(result.optional).toEqualTypeOf<number | undefined>();
    });
  });
});
