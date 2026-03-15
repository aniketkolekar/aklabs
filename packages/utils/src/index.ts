/**
 * @aklabs/utils
 * Zero-dependency TypeScript utility functions
 */

export const VERSION = '0.0.1';

export { debounce } from './debounce/debounce.js';
export type { DebounceOptions, DebouncedFunction } from './debounce/debounce.js';

export { throttle } from './throttle/throttle.js';
export type { ThrottleOptions, ThrottledFunction } from './throttle/throttle.js';

export { cloneDeep } from './cloneDeep/cloneDeep.js';

export { merge } from './merge/merge.js';

export { isEqual } from './isEqual/isEqual.js';

export { pick } from './pick/pick.js';

export { omit } from './omit/omit.js';
