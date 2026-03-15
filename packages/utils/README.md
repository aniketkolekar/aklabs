# @aklabs/utils

Zero-dependency, TypeScript-native utility functions.

## Install

```bash
npm install @aklabs/utils
```

## Usage

```ts
import { debounce } from '@aklabs/utils';
```

## Utilities

| Function    | Description                                  |
| ----------- | -------------------------------------------- |
| `debounce`  | Delay function execution until after wait ms |
| `throttle`  | Limit function execution to once per wait ms |
| `cloneDeep` | Deep clone an object                         |
| `merge`     | Deep merge objects with source priority      |
| `isEqual`   | Deep equality check                          |
| `pick`      | Pick keys from an object (type-safe)         |
| `omit`      | Omit keys from an object (type-safe)         |
| `storage`   | Type-safe localStorage wrapper               |
