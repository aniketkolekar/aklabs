import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { throttle, type ThrottledFunction } from './throttle.js';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('basic behavior', () => {
    it('does not invoke more than once per wait period', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('invokes on leading edge by default', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does not invoke trailing by default', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('trailing edge', () => {
    it('trailing: true - invokes after last call', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { trailing: true });

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      throttled();
      throttled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('leading: false, trailing: true - only trailing', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { leading: false, trailing: true });

      throttled();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('both leading and trailing true', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { leading: true, trailing: true });

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      throttled();
      throttled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('.cancel()', () => {
    it('prevents pending trailing invocation', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100, { trailing: true });

      throttled();
      throttled();
      throttled.cancel();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('is safe to call when no invocation is pending', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      expect(() => throttled.cancel()).not.toThrow();

      throttled();
      vi.advanceTimersByTime(100);
      expect(() => throttled.cancel()).not.toThrow();
    });
  });

  describe('.flush()', () => {
    it('triggers pending trailing immediately', () => {
      const fn = vi.fn(() => 'result');
      const throttled = throttle(fn, 100, { trailing: true });

      throttled();
      throttled();

      const result = throttled.flush();

      expect(fn).toHaveBeenCalledTimes(2);
      expect(result).toBe('result');
    });

    it('returns undefined when no trailing invocation is pending', () => {
      const fn = vi.fn(() => 'result');
      const throttled = throttle(fn, 100);

      const result = throttled.flush();

      expect(result).toBeUndefined();
      expect(fn).not.toHaveBeenCalled();
    });

    it('returns last result when trailing is false', () => {
      const fn = vi.fn(() => 'result');
      const throttled = throttle(fn, 100, { trailing: false });

      throttled();
      const result = throttled.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });
  });

  describe('arguments and return values', () => {
    it('passes all arguments to the original function correctly', () => {
      const fn = vi.fn((a: number, b: string, c: boolean) => ({ a, b, c }));
      const throttled = throttle(fn, 100);

      throttled(1, 'test', true);

      expect(fn).toHaveBeenCalledWith(1, 'test', true);
    });

    it('returns the result of the last invocation', () => {
      const fn = vi.fn((x: number) => x * 2);
      const throttled = throttle(fn, 100);

      const result1 = throttled(5);
      expect(result1).toBe(10);

      vi.advanceTimersByTime(100);

      const result2 = throttled(10);
      expect(result2).toBe(20);
    });
  });

  describe('edge cases', () => {
    it('works correctly when wait is 0', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 0);

      throttled();
      vi.advanceTimersByTime(0);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('preserves this context', () => {
      const fn = vi.fn(function (this: { value: number }) {
        return this.value;
      });
      const throttled = throttle(fn, 100);

      const context = { value: 42 };
      throttled.call(context);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.results[0]?.value).toBe(42);
    });
  });

  describe('TypeScript type tests', () => {
    it('inferred return type matches the original function return type', () => {
      const fn = (x: number): string => x.toString();
      const throttled = throttle(fn, 100);

      expectTypeOf(throttled).returns.toEqualTypeOf<string | undefined>();
    });

    it('parameters type matches the original function parameters', () => {
      const fn = (a: number, b: string, c: boolean): void => {
        console.log(a, b, c);
      };
      const throttled = throttle(fn, 100);

      expectTypeOf(throttled).parameters.toEqualTypeOf<[number, string, boolean]>();
    });

    it('.flush() return type is ReturnType<T> | undefined', () => {
      const fn = (): number => 42;
      const throttled = throttle(fn, 100);

      expectTypeOf(throttled.flush).returns.toEqualTypeOf<number | undefined>();
    });

    it('throttled function type includes cancel and flush methods', () => {
      const fn = (): void => {
        // no-op
      };
      const throttled = throttle(fn, 100);

      expectTypeOf(throttled).toMatchTypeOf<ThrottledFunction<typeof fn>>();
      expectTypeOf(throttled.cancel).toBeFunction();
      expectTypeOf(throttled.flush).toBeFunction();
    });
  });
});
