# aklabs

Monorepo for `@aklabs` — TypeScript utilities and tools.

## Packages

| Package                                       | Description                                  | Import          |
| --------------------------------------------- | -------------------------------------------- | --------------- |
| [`@aklabs/utils`](./packages/utils/README.md) | Zero-dependency TypeScript utility functions | `@aklabs/utils` |

## Quick Start

**Step 1** — Switch to the correct Node version:

```bash
nvm use
```

**Step 2** — Enable pnpm:

```bash
corepack enable
```

**Step 3** — Run the setup script:

```bash
bash scripts/setup.sh
```

## Common Commands

```bash
pnpm build:all       # Build all packages
pnpm test            # Run all tests
pnpm lint            # Lint all packages
pnpm typecheck       # Typecheck all packages
pnpm format          # Format all files
```

## Tech Stack

| Tool       | Version |
| ---------- | ------- |
| Node       | 20.18.1 |
| pnpm       | 9.15.0  |
| NX         | 22.5.4  |
| TypeScript | 5.9.2   |
| Vite       | 7.0.0   |
| Vitest     | 4.0.18  |
