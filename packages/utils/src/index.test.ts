import { describe, expect, expectTypeOf, it } from 'vitest';

import * as utils from './index.js';

describe('utils package exports', () => {
  describe('function exports', () => {
    it('exports debounce', () => {
      expect(utils.debounce).toBeDefined();
      expect(typeof utils.debounce).toBe('function');
    });

    it('exports throttle', () => {
      expect(utils.throttle).toBeDefined();
      expect(typeof utils.throttle).toBe('function');
    });

    it('exports cloneDeep', () => {
      expect(utils.cloneDeep).toBeDefined();
      expect(typeof utils.cloneDeep).toBe('function');
    });

    it('exports merge', () => {
      expect(utils.merge).toBeDefined();
      expect(typeof utils.merge).toBe('function');
    });

    it('exports isEqual', () => {
      expect(utils.isEqual).toBeDefined();
      expect(typeof utils.isEqual).toBe('function');
    });

    it('exports pick', () => {
      expect(utils.pick).toBeDefined();
      expect(typeof utils.pick).toBe('function');
    });

    it('exports omit', () => {
      expect(utils.omit).toBeDefined();
      expect(typeof utils.omit).toBe('function');
    });
  });

  describe('type exports', () => {
    it('DebounceOptions type is available', () => {
      type Options = utils.DebounceOptions;
      const opts: Options = { leading: true, trailing: false };

      expectTypeOf(opts).toMatchTypeOf<utils.DebounceOptions>();
    });

    it('DebouncedFunction type is available', () => {
      const fn = (x: number): string => x.toString();
      const debounced = utils.debounce(fn, 100);

      expectTypeOf(debounced).toMatchTypeOf<utils.DebouncedFunction<typeof fn>>();
    });

    it('ThrottleOptions type is available', () => {
      type Options = utils.ThrottleOptions;
      const opts: Options = { leading: false, trailing: true };

      expectTypeOf(opts).toMatchTypeOf<utils.ThrottleOptions>();
    });

    it('ThrottledFunction type is available', () => {
      const fn = (x: number): string => x.toString();
      const throttled = utils.throttle(fn, 100);

      expectTypeOf(throttled).toMatchTypeOf<utils.ThrottledFunction<typeof fn>>();
    });
  });

  describe('no unexpected exports', () => {
    it('exports exactly 7 functions', () => {
      const exportedFunctions = Object.keys(utils).filter(
        (key) => typeof utils[key as keyof typeof utils] === 'function',
      );

      expect(exportedFunctions).toHaveLength(7);
      expect(exportedFunctions.sort()).toEqual([
        'cloneDeep',
        'debounce',
        'isEqual',
        'merge',
        'omit',
        'pick',
        'throttle',
      ]);
    });
  });
});
