# aklabs

TypeScript utilities and tools, published under the `@aklabs` scope.

## Packages

| Package                                       | Description                                  | Version |
| --------------------------------------------- | -------------------------------------------- | ------- |
| [`@aklabs/utils`](./packages/utils/README.md) | Zero-dependency TypeScript utility functions | 0.0.1   |

## Getting Started

For contributors and developers working on the monorepo:

```bash
# Clone the repository
git clone https://github.com/aniketkolekar/aklabs.git
cd aklabs

# Switch to the correct Node version
nvm use

# Enable pnpm
corepack enable

# Run setup (installs dependencies and configures git hooks)
bash scripts/setup.sh
```

The `setup.sh` script handles dependency installation and Husky setup automatically.

## Common Commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm build:all`     | Build all packages                   |
| `pnpm test`          | Run all tests                        |
| `pnpm test:affected` | Run tests for affected projects only |
| `pnpm lint`          | Lint all packages                    |
| `pnpm typecheck`     | Typecheck all packages               |
| `pnpm format`        | Format all files                     |
| `pnpm format:check`  | Check formatting without writing     |

## Tech Stack

| Tool       | Version |
| ---------- | ------- |
| Node       | 20.18.1 |
| pnpm       | 9.15.0  |
| NX         | 22.5.4  |
| TypeScript | 5.9.2   |
| Vite       | 7.0.0   |
| Vitest     | 4.0.18  |

## Contributing

Contributions are welcome. Please open an issue before submitting a PR for non-trivial changes. All
commits must follow [Conventional Commits](https://www.conventionalcommits.org/).

**Aniket Kolekar** — [aniketkolekar.vercel.app](https://aniketkolekar.vercel.app) ·
[GitHub](https://github.com/aniketkolekar)

## License

MIT © 2026 Aniket Kolekar
