/**
 * Options for configuring throttle behavior
 */
export interface ThrottleOptions {
  /**
   * Invoke on the leading edge of the timeout.
   * @default true
   */
  leading?: boolean;
  /**
   * Invoke on the trailing edge of the timeout.
   * @default false
   */
  trailing?: boolean;
}

/**
 * A throttled function with additional control methods
 */
export interface ThrottledFunction<T extends (...args: never[]) => unknown> {
  /**
   * Invokes the throttled function with the given arguments.
   * Returns the result if invoked, otherwise undefined.
   */
  (...args: Parameters<T>): ReturnType<T> | undefined;
  /**
   * Cancels any pending trailing invocation and resets the throttle window.
   * The next call after cancel() will invoke immediately as if the throttled
   * function was just created.
   */
  cancel(): void;
  /**
   * Immediately invokes any pending invocation and returns the result
   */
  flush(): ReturnType<T> | undefined;
}

/**
 * Creates a throttled function that only invokes `fn` at most once per `wait` milliseconds.
 *
 * The throttled function comes with a `cancel` method to cancel delayed invocations
 * and a `flush` method to immediately invoke them.
 *
 * @description
 * Throttling is useful for rate-limiting functions that fire frequently, such as
 * scroll handlers, resize handlers, or mouse move handlers. Unlike debouncing,
 * throttling guarantees the function executes at regular intervals during sustained
 * activity. By default, the function is invoked on the leading edge.
 *
 * @param fn - The function to throttle
 * @param wait - The number of milliseconds to throttle invocations to
 * @param options - Configuration options
 * @param options.leading - Invoke on the leading edge of the timeout. Default: true
 * @param options.trailing - Invoke on the trailing edge of the timeout. Default: false
 * @returns A throttled version of the function with `cancel` and `flush` methods
 *
 * @example
 * ```ts
 * // Basic usage - invokes immediately, then at most once per 200ms
 * const handleScroll = throttle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 200);
 *
 * window.addEventListener('scroll', handleScroll);
 * ```
 *
 * @example
 * ```ts
 * // Trailing only - invokes after activity stops
 * const saveData = throttle(
 *   (data: string) => fetch('/api/save', { method: 'POST', body: data }),
 *   1000,
 *   { leading: false, trailing: true }
 * );
 *
 * input.addEventListener('input', (e) => saveData(e.target.value));
 * ```
 *
 * @example
 * ```ts
 * // Using cancel and flush
 * const throttledFn = throttle(() => console.log('executed'), 1000);
 *
 * throttledFn();
 * throttledFn.cancel(); // Cancels any pending trailing invocation
 *
 * throttledFn();
 * throttledFn.flush(); // Executes immediately if trailing is pending
 * ```
 */
export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {},
): ThrottledFunction<T> {
  const { leading = true, trailing = false } = options;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: unknown;
  let result: ReturnType<T> | undefined;
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

  function shouldInvoke(time: number): boolean {
    const timeSinceLastInvoke = time - lastInvokeTime;

    return lastInvokeTime === 0 || timeSinceLastInvoke >= wait;
  }

  function remainingWait(time: number): number {
    const timeSinceLastInvoke = time - lastInvokeTime;
    return wait - timeSinceLastInvoke;
  }

  function timerExpired(): void {
    const time = Date.now();

    if (trailing && lastArgs) {
      invokeFunc(time);
    }

    timeoutId = undefined;
    lastArgs = undefined;
    lastThis = undefined;
  }

  function cancel(): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    lastInvokeTime = 0;
    lastArgs = undefined;
    lastThis = undefined;
    timeoutId = undefined;
  }

  function flush(): ReturnType<T> | undefined {
    if (timeoutId === undefined) {
      return result;
    }

    const time = Date.now();
    return trailing && lastArgs ? invokeFunc(time) : result;
  }

  function throttled(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- Need to capture 'this' context for fn.apply
    lastThis = this;

    if (isInvoking) {
      if (timeoutId === undefined && leading) {
        lastInvokeTime = time;
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(time);
      }

      if (timeoutId === undefined) {
        timeoutId = setTimeout(timerExpired, wait);
      }

      return result;
    }

    if (timeoutId === undefined && trailing) {
      timeoutId = setTimeout(timerExpired, remainingWait(time));
    }

    return result;
  }

  throttled.cancel = cancel;
  throttled.flush = flush;

  return throttled;
}
