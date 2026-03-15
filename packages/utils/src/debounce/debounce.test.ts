import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { debounce, type DebouncedFunction } from './debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  describe('basic behavior', () => {
    it('does not invoke immediately when called', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();

      expect(fn).not.toHaveBeenCalled();
    });

    it('invokes after the wait period elapses', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('resets the timer on each call - only invokes once after multiple rapid calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('returns undefined before the debounced function has been invoked', () => {
      const fn = vi.fn(() => 'result');
      const debounced = debounce(fn, 100);

      const result = debounced();

      expect(result).toBeUndefined();
    });
  });

  describe('leading edge', () => {
    it('invokes immediately on the first call when leading: true', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { leading: true });

      debounced();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does not invoke again on trailing edge when trailing: false, leading: true', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { leading: true, trailing: false });

      debounced();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('invokes on both edges when both are true and called multiple times', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { leading: true, trailing: true });

      debounced();
      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(50);
      debounced();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('trailing edge (default)', () => {
    it('invokes on the trailing edge by default', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does not invoke if cancelled before wait elapses', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('.cancel()', () => {
    it('prevents the pending invocation from firing', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });

    it('is safe to call when no invocation is pending', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      expect(() => debounced.cancel()).not.toThrow();

      debounced();
      vi.advanceTimersByTime(100);
      expect(() => debounced.cancel()).not.toThrow();
    });
  });

  describe('.flush()', () => {
    it('immediately invokes and returns the result', () => {
      const fn = vi.fn(() => 'result');
      const debounced = debounce(fn, 100);

      debounced();
      const result = debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('result');
    });

    it('returns undefined when no invocation is pending', () => {
      const fn = vi.fn(() => 'result');
      const debounced = debounce(fn, 100);

      const result = debounced.flush();

      expect(result).toBeUndefined();
      expect(fn).not.toHaveBeenCalled();
    });

    it('clears the pending timer after flushing', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.flush();
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('arguments and return values', () => {
    it('passes all arguments to the original function correctly', () => {
      const fn = vi.fn((a: number, b: string, c: boolean) => ({ a, b, c }));
      const debounced = debounce(fn, 100);

      debounced(1, 'test', true);
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith(1, 'test', true);
    });

    it('returns the result of the last invocation', () => {
      const fn = vi.fn((x: number) => x * 2);
      const debounced = debounce(fn, 100);

      debounced(5);
      vi.advanceTimersByTime(100);

      const result = debounced(10);
      vi.advanceTimersByTime(100);

      expect(result).toBe(10);
      expect(fn).toHaveBeenLastCalledWith(10);
    });
  });

  describe('edge cases', () => {
    it('never invokes when both leading and trailing are false', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, { leading: false, trailing: false });

      debounced();
      vi.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });

    it('works correctly when wait is 0', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 0);

      debounced();
      vi.advanceTimersByTime(0);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('preserves this context', () => {
      const fn = vi.fn(function (this: { value: number }) {
        return this.value;
      });
      const debounced = debounce(fn, 100);

      const context = { value: 42 };
      debounced.call(context);
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.results[0]?.value).toBe(42);
    });
  });

  describe('TypeScript type tests', () => {
    it('inferred return type matches the original function return type', () => {
      const fn = (x: number): string => x.toString();
      const debounced = debounce(fn, 100);

      expectTypeOf(debounced).returns.toEqualTypeOf<string | undefined>();
    });

    it('parameters type matches the original function parameters', () => {
      const fn = (a: number, b: string, c: boolean): void => {
        console.log(a, b, c);
      };
      const debounced = debounce(fn, 100);

      expectTypeOf(debounced).parameters.toEqualTypeOf<[number, string, boolean]>();
    });

    it('.flush() return type is ReturnType<T> | undefined', () => {
      const fn = (): number => 42;
      const debounced = debounce(fn, 100);

      expectTypeOf(debounced.flush).returns.toEqualTypeOf<number | undefined>();
    });

    it('debounced function type includes cancel and flush methods', () => {
      const fn = (): void => {
        // no-op
      };
      const debounced = debounce(fn, 100);

      expectTypeOf(debounced).toMatchTypeOf<DebouncedFunction<typeof fn>>();
      expectTypeOf(debounced.cancel).toBeFunction();
      expectTypeOf(debounced.flush).toBeFunction();
    });
  });
});
