import { describe, expect, expectTypeOf, it } from 'vitest';

import { cloneDeep } from './cloneDeep.js';

describe('cloneDeep', () => {
  describe('primitives', () => {
    it('clones string', () => {
      const original = 'hello';
      const cloned = cloneDeep(original);

      expect(cloned).toBe('hello');
    });

    it('clones number', () => {
      const original = 42;
      const cloned = cloneDeep(original);

      expect(cloned).toBe(42);
    });

    it('clones boolean', () => {
      const original = true;
      const cloned = cloneDeep(original);

      expect(cloned).toBe(true);
    });

    it('clones null', () => {
      const original = null;
      const cloned = cloneDeep(original);

      expect(cloned).toBeNull();
    });

    it('clones undefined', () => {
      const original = undefined;
      const cloned = cloneDeep(original);

      expect(cloned).toBeUndefined();
    });
  });

  describe('nested objects', () => {
    it('clones simple object', () => {
      const original = { a: 1, b: 2 };
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('clones deeply nested object', () => {
      const original = { a: 1, b: { c: 2, d: { e: 3 } } };
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it('preserves undefined values in objects', () => {
      const original = { a: 1, b: undefined, c: 3 };
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect('b' in cloned).toBe(true);
      expect(cloned.b).toBeUndefined();
    });
  });

  describe('arrays and nested arrays', () => {
    it('clones simple array', () => {
      const original = [1, 2, 3];
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
    });

    it('clones nested arrays', () => {
      const original = [1, [2, [3, 4]], 5];
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned[1]).not.toBe(original[1]);
      expect((cloned[1] as number[])[1]).not.toBe((original[1] as number[])[1]);
    });

    it('clones array of objects', () => {
      const original = [{ a: 1 }, { b: 2 }];
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned[0]).not.toBe(original[0]);
      expect(cloned[1]).not.toBe(original[1]);
    });
  });

  describe('Date', () => {
    it('clones Date object', () => {
      const original = new Date('2024-01-01');
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned instanceof Date).toBe(true);
      expect(cloned.getTime()).toBe(original.getTime());
    });
  });

  describe('RegExp', () => {
    it('clones RegExp object', () => {
      const original = /test/gi;
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned instanceof RegExp).toBe(true);
      expect(cloned.source).toBe(original.source);
      expect(cloned.flags).toBe(original.flags);
    });

    it('preserves lastIndex on RegExp', () => {
      const original = /test/g;
      original.lastIndex = 5;
      const cloned = cloneDeep(original);

      expect(cloned.lastIndex).toBe(5);
    });
  });

  describe('Map and Set', () => {
    it('clones Map', () => {
      const original = new Map<string, string | { nested: string }>([
        ['key1', 'value1'],
        ['key2', { nested: 'value' }],
      ]);
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned instanceof Map).toBe(true);
      expect(cloned.get('key2')).not.toBe(original.get('key2'));
    });

    it('clones Set', () => {
      const original = new Set([1, 2, { a: 3 }]);
      const cloned = cloneDeep(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned instanceof Set).toBe(true);
    });
  });

  describe('circular references', () => {
    it('handles circular reference without throwing', () => {
      const obj: { self?: unknown; value: number } = { value: 42 };
      obj.self = obj;

      const cloned = cloneDeep(obj);

      expect(cloned.value).toBe(42);
      expect(cloned.self).toBe(cloned);
      expect(cloned).not.toBe(obj);
    });

    it('handles circular reference in nested structure', () => {
      const obj: { child?: unknown; value: number } = { value: 1 };
      const child: { parent?: unknown; value: number } = { value: 2 };
      obj.child = child;
      child.parent = obj;

      const cloned = cloneDeep(obj);

      expect(cloned.value).toBe(1);
      expect((cloned.child as typeof child).value).toBe(2);
      expect((cloned.child as typeof child).parent).toBe(cloned);
    });
  });

  describe('deep independence', () => {
    it('modifying clone does not affect original', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = cloneDeep(original);

      cloned.b.c = 99;

      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(99);
    });

    it('modifying cloned array does not affect original', () => {
      const original = [1, [2, 3]];
      const cloned = cloneDeep(original);

      (cloned[1] as number[])[0] = 99;

      expect((original[1] as number[])[0]).toBe(2);
      expect((cloned[1] as number[])[0]).toBe(99);
    });
  });

  describe('functions', () => {
    it('returns functions as-is', () => {
      const fn = (): string => 'test';
      const cloned = cloneDeep(fn);

      expect(cloned).toBe(fn);
    });

    it('returns functions in objects as-is', () => {
      const original = {
        value: 42,
        method: (): string => 'test',
      };
      const cloned = cloneDeep(original);

      expect(cloned.method).toBe(original.method);
      expect(cloned.value).toBe(42);
    });
  });

  describe('TypeScript type tests', () => {
    it('return type matches input type', () => {
      interface MyType {
        a: number;
        b: string;
      }

      const original: MyType = { a: 1, b: 'test' };
      const cloned = cloneDeep(original);

      expectTypeOf(cloned).toEqualTypeOf<MyType>();
    });

    it('preserves complex types', () => {
      interface ComplexType {
        arr: number[];
        obj: { nested: string };
        optional?: boolean;
      }

      const original: ComplexType = {
        arr: [1, 2, 3],
        obj: { nested: 'value' },
      };

      const cloned = cloneDeep(original);

      expectTypeOf(cloned).toEqualTypeOf<ComplexType>();
    });

    it('preserves array types', () => {
      const original: (string | number)[] = ['test', 42];
      const cloned = cloneDeep(original);

      expectTypeOf(cloned).toEqualTypeOf<(string | number)[]>();
    });
  });
});
