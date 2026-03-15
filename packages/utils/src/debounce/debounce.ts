/**
 * Options for configuring debounce behavior
 */
export interface DebounceOptions {
  /**
   * Invoke on the leading edge of the timeout.
   * @default false
   */
  leading?: boolean;
  /**
   * Invoke on the trailing edge of the timeout.
   * @default true
   */
  trailing?: boolean;
}

/**
 * A debounced function with additional control methods
 */
export interface DebouncedFunction<T extends (...args: never[]) => unknown> {
  /**
   * Invokes the debounced function with the given arguments.
   * Returns the result if invoked, otherwise undefined.
   */
  (...args: Parameters<T>): ReturnType<T> | undefined;
  /**
   * Cancels any pending invocation
   */
  cancel(): void;
  /**
   * Immediately invokes any pending invocation and returns the result
   */
  flush(): ReturnType<T> | undefined;
}

/**
 * Creates a debounced function that delays invoking `fn` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * The debounced function comes with a `cancel` method to cancel delayed invocations
 * and a `flush` method to immediately invoke them.
 *
 * @description
 * Debouncing is useful for rate-limiting functions that are called frequently,
 * such as resize handlers, scroll handlers, or search input handlers. By default,
 * the function is invoked on the trailing edge of the wait timeout. You can
 * configure it to invoke on the leading edge, trailing edge, or both.
 *
 * @param fn - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @param options - Configuration options
 * @param options.leading - Invoke on the leading edge of the timeout. Default: false
 * @param options.trailing - Invoke on the trailing edge of the timeout. Default: true
 * @returns A debounced version of the function with `cancel` and `flush` methods
 *
 * @example
 * ```ts
 * // Basic usage - invokes after 300ms of inactivity
 * const saveInput = debounce((value: string) => {
 *   console.log('Saving:', value);
 * }, 300);
 *
 * saveInput('a');
 * saveInput('ab');
 * saveInput('abc'); // Only this will execute after 300ms
 * ```
 *
 * @example
 * ```ts
 * // Leading edge - invokes immediately on first call
 * const search = debounce(
 *   (query: string) => fetch(`/api/search?q=${query}`),
 *   500,
 *   { leading: true, trailing: false }
 * );
 *
 * search('hello'); // Executes immediately
 * search('hello world'); // Ignored if within 500ms
 * ```
 *
 * @example
 * ```ts
 * // Using cancel and flush
 * const debouncedFn = debounce(() => console.log('executed'), 1000);
 *
 * debouncedFn();
 * debouncedFn.cancel(); // Cancels the pending invocation
 *
 * debouncedFn();
 * debouncedFn.flush(); // Executes immediately
 * ```
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
  options: DebounceOptions = {},
): DebouncedFunction<T> {
  const { leading = false, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = undefined;
    lastThis = undefined;
    lastInvokeTime = time;

    result = fn.apply(thisArg, args as Parameters<T>) as ReturnType<T>;
    return result;
  }

  function shouldInvokeLeading(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastInvoke >= wait;
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time;

    timeoutId = setTimeout(timerExpired, wait);

    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return timeSinceLastInvoke < wait
      ? Math.min(timeWaiting, wait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvokeTrailing(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime ?? 0);

    return lastCallTime !== undefined && (timeSinceLastCall >= wait || timeSinceLastCall < 0);
  }

  function timerExpired(): void {
    const time = Date.now();

    if (shouldInvokeTrailing(time)) {
      trailingEdge(time);
      return;
    }

    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    timeoutId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = undefined;
    lastThis = undefined;

    return result;
  }

  function cancel(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = undefined;
    lastThis = undefined;
    timeoutId = undefined;
  }

  function flush(): ReturnType<T> | undefined {
    if (timeoutId === undefined) {
      return result;
    }

    return trailingEdge(Date.now());
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvokeLeading(time);

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- Need to capture 'this' context for fn.apply
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === undefined) {
        return leadingEdge(lastCallTime);
      }

      if (leading) {
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }

    if (timeoutId === undefined) {
      timeoutId = setTimeout(timerExpired, wait);
    }

    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}
