import { describe, expect, expectTypeOf, it } from 'vitest';

import { isEqual } from './isEqual.js';

describe('isEqual', () => {
  describe('primitives', () => {
    it('returns true for equal numbers', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual(0, 0)).toBe(true);
      expect(isEqual(-5, -5)).toBe(true);
    });

    it('returns false for different numbers', () => {
      expect(isEqual(1, 2)).toBe(false);
      expect(isEqual(0, 1)).toBe(false);
    });

    it('returns true for equal strings', () => {
      expect(isEqual('hello', 'hello')).toBe(true);
      expect(isEqual('', '')).toBe(true);
    });

    it('returns false for different strings', () => {
      expect(isEqual('hello', 'world')).toBe(false);
    });

    it('returns true for equal booleans', () => {
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(false, false)).toBe(true);
    });

    it('returns false for different booleans', () => {
      expect(isEqual(true, false)).toBe(false);
    });
  });

  describe('NaN handling', () => {
    it('NaN equals NaN', () => {
      expect(isEqual(NaN, NaN)).toBe(true);
    });

    it('NaN does not equal number', () => {
      expect(isEqual(NaN, 0)).toBe(false);
      expect(isEqual(NaN, 1)).toBe(false);
    });
  });

  describe('null and undefined', () => {
    it('null equals null', () => {
      expect(isEqual(null, null)).toBe(true);
    });

    it('undefined equals undefined', () => {
      expect(isEqual(undefined, undefined)).toBe(true);
    });

    it('null does not equal undefined', () => {
      expect(isEqual(null, undefined)).toBe(false);
    });

    it('null does not equal other values', () => {
      expect(isEqual(null, 0)).toBe(false);
      expect(isEqual(null, '')).toBe(false);
      expect(isEqual(null, false)).toBe(false);
    });
  });

  describe('objects', () => {
    it('returns true for equal objects', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('returns false for different objects', () => {
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('returns false for objects with different key count', () => {
      expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('returns false for objects with extra keys', () => {
      expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    it('property order does not matter', () => {
      expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    });
  });

  describe('nested objects', () => {
    it('returns true for deeply equal nested objects', () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 3 } } };

      expect(isEqual(obj1, obj2)).toBe(true);
    });

    it('returns false for nested objects with different values', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };

      expect(isEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('returns true for equal arrays', () => {
      expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false for arrays with different values', () => {
      expect(isEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('returns false for arrays with different length', () => {
      expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns true for nested arrays', () => {
      expect(isEqual([1, [2, [3, 4]]], [1, [2, [3, 4]]])).toBe(true);
    });

    it('returns false for different nested arrays', () => {
      expect(isEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
    });
  });

  describe('Date objects', () => {
    it('returns true for equal dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');

      expect(isEqual(date1, date2)).toBe(true);
    });

    it('returns false for different dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      expect(isEqual(date1, date2)).toBe(false);
    });
  });

  describe('RegExp objects', () => {
    it('returns true for equal RegExp', () => {
      expect(isEqual(/test/gi, /test/gi)).toBe(true);
    });

    it('returns false for different patterns', () => {
      expect(isEqual(/test/, /other/)).toBe(false);
    });

    it('returns false for different flags', () => {
      expect(isEqual(/test/g, /test/i)).toBe(false);
    });
  });

  describe('Map and Set', () => {
    it('returns true for equal Maps', () => {
      const map1 = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      const map2 = new Map([
        ['a', 1],
        ['b', 2],
      ]);

      expect(isEqual(map1, map2)).toBe(true);
    });

    it('returns false for different Maps', () => {
      const map1 = new Map([['a', 1]]);
      const map2 = new Map([['a', 2]]);

      expect(isEqual(map1, map2)).toBe(false);
    });

    it('returns true for equal Sets', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 3]);

      expect(isEqual(set1, set2)).toBe(true);
    });

    it('returns false for different Sets', () => {
      const set1 = new Set([1, 2, 3]);
      const set2 = new Set([1, 2, 4]);

      expect(isEqual(set1, set2)).toBe(false);
    });
  });

  describe('circular references', () => {
    it('handles circular references without throwing', () => {
      const obj1: { self?: unknown; value: number } = { value: 42 };
      obj1.self = obj1;

      const obj2: { self?: unknown; value: number } = { value: 42 };
      obj2.self = obj2;

      expect(() => isEqual(obj1, obj2)).not.toThrow();
      expect(isEqual(obj1, obj2)).toBe(true);
    });

    it('detects different circular structures', () => {
      const obj1: { self?: unknown; value: number } = { value: 42 };
      obj1.self = obj1;

      const obj2: { self?: unknown; value: number } = { value: 99 };
      obj2.self = obj2;

      expect(isEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('different types', () => {
    it('1 does not equal "1"', () => {
      expect(isEqual(1, '1')).toBe(false);
    });

    it('0 does not equal false', () => {
      expect(isEqual(0, false)).toBe(false);
    });

    it('empty string does not equal false', () => {
      expect(isEqual('', false)).toBe(false);
    });

    it('array does not equal object', () => {
      expect(isEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
    });
  });

  describe('TypeScript type tests', () => {
    it('returns boolean', () => {
      const result = isEqual(1, 2);

      expectTypeOf(result).toEqualTypeOf<boolean>();
    });

    it('accepts any types', () => {
      const result1 = isEqual(1, 'string');
      const result2 = isEqual({ a: 1 }, [1, 2]);
      const result3 = isEqual(null, undefined);

      expectTypeOf(result1).toEqualTypeOf<boolean>();
      expectTypeOf(result2).toEqualTypeOf<boolean>();
      expectTypeOf(result3).toEqualTypeOf<boolean>();
    });
  });
});
