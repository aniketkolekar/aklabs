import { describe, expect, expectTypeOf, it } from 'vitest';

import { merge } from './merge.js';

describe('merge', () => {
  describe('simple flat merge', () => {
    it('merges two flat objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('returns the mutated target', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = merge(target, source);

      expect(result).toBe(target);
      expect(target).toEqual({ a: 1, b: 2 });
    });
  });

  describe('nested object merge', () => {
    it('deep merges nested objects', () => {
      const target = { a: 1, b: { c: 2, d: 3 } };
      const source = { b: { d: 4, e: 5 } };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: { c: 2, d: 4, e: 5 } });
    });

    it('merges deeply nested structures', () => {
      const target = { level1: { level2: { level3: { a: 1 } } } };
      const source = { level1: { level2: { level3: { b: 2 } } } };
      const result = merge(target, source);

      expect(result.level1.level2.level3).toEqual({ a: 1, b: 2 });
    });
  });

  describe('undefined and null handling', () => {
    it('undefined in source does not overwrite target', () => {
      const target = { a: 1, b: 2 };
      const source = { a: undefined, c: 3 };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('null in source does overwrite target', () => {
      const target = { a: 1, b: 2 };
      const source = { a: null, c: 3 };
      const result = merge(target, source);

      expect(result).toEqual({ a: null, b: 2, c: 3 });
    });

    it('undefined in nested source does not overwrite', () => {
      const target = { a: { b: 1, c: 2 } };
      const source = { a: { b: undefined, d: 3 } };
      const result = merge(target, source);

      expect(result).toEqual({ a: { b: 1, c: 2, d: 3 } });
    });
  });

  describe('arrays are replaced', () => {
    it('replaces array completely', () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4, 5] };
      const result = merge(target, source);

      expect(result).toEqual({ a: [3, 4, 5] });
    });

    it('does not merge array elements', () => {
      const target = { arr: [{ a: 1 }, { b: 2 }] };
      const source = { arr: [{ c: 3 }] };
      const result = merge(target, source);

      expect(result).toEqual({ arr: [{ c: 3 }] });
    });
  });

  describe('multiple sources', () => {
    it('merges multiple sources in order', () => {
      const target = { a: 1 };
      const result = merge(target, { a: 2, b: 2 }, { a: 3, c: 3 });

      expect(result).toEqual({ a: 3, b: 2, c: 3 });
    });

    it('third source overwrites second', () => {
      const target = { x: { y: 1 } };
      const result = merge(target, { x: { y: 2, z: 2 } }, { x: { y: 3 } });

      expect(result).toEqual({ x: { y: 3, z: 2 } });
    });
  });

  describe('mutation behavior', () => {
    it('target is mutated', () => {
      const target = { a: 1 };
      const source = { b: 2 };

      merge(target, source);

      expect(target).toEqual({ a: 1, b: 2 });
    });

    it('sources are not mutated', () => {
      const target = { a: 1 };
      const source1 = { b: 2 };
      const source2 = { c: 3 };

      merge(target, source1, source2);

      expect(source1).toEqual({ b: 2 });
      expect(source2).toEqual({ c: 3 });
    });
  });

  describe('edge cases', () => {
    it('handles empty source', () => {
      const target = { a: 1 };
      const result = merge(target, {});

      expect(result).toEqual({ a: 1 });
    });

    it('handles empty target', () => {
      const target = {};
      const source = { a: 1, b: 2 };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('handles source with only undefined values', () => {
      const target = { a: 1, b: 2 };
      const source = { a: undefined, b: undefined };
      const result = merge(target, source);

      expect(result).toEqual({ a: 1, b: 2 });
    });
  });

  describe('TypeScript type tests', () => {
    it('handles single source', () => {
      const target = { a: 1 };
      const source = { b: 'test' };

      const result = merge(target, source);

      expectTypeOf(result).toMatchTypeOf<{ a: number; b: string }>();
    });

    it('result includes target properties', () => {
      interface Target {
        existing: string;
      }
      interface Source {
        added: number;
      }

      const target: Target = { existing: 'value' };
      const source: Source = { added: 42 };

      const result = merge(target, source);

      expectTypeOf(result).toMatchTypeOf<Target & Source>();
      expectTypeOf(result.existing).toEqualTypeOf<string>();
      expectTypeOf(result.added).toEqualTypeOf<number>();
    });
  });
});
