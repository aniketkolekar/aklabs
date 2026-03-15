# Contributing to aklabs

## PR title

Format: `type(scope): short description`

**Type** must be one of:

| Type       | When to use                           |
| ---------- | ------------------------------------- |
| `feat`     | New utility, new feature, new package |
| `fix`      | Bug fix, correctness issue, edge case |
| `docs`     | README, JSDoc, comments only          |
| `chore`    | Tooling, config, dependencies, CI     |
| `refactor` | Code change with no behaviour change  |
| `test`     | Adding or fixing tests only           |
| `perf`     | Performance improvement               |

**Scope** must be one of:

| Scope     | When to use                                  |
| --------- | -------------------------------------------- |
| `utils`   | Changes to `@aklabs/utils`                   |
| `browser` | Changes to `@aklabs/browser` (future)        |
| `repo`    | Monorepo-level changes (config, CI, tooling) |
| `deps`    | Dependency updates                           |

**Rules:**

- Lowercase only — no sentence case, no ALL CAPS
- Present tense — "add debounce" not "added debounce"
- No period at the end
- Under 72 characters total
- Be specific — "add debounce utility" not "add utility"

**Examples:**

```
feat(utils): add debounce utility
fix(utils): handle undefined property values in cloneDeep
docs(utils): update README with storage exclusion note
chore(repo): add PR template and contributing guidelines
refactor(utils): simplify isEqual by removing duplicate guards
test(utils): add edge case for debounce with both edges false
perf(utils): optimise Set equality check in isEqual to O(1)
deps(repo): update nx to 22.6.0
```

## PR description

Every PR must use the template loaded automatically when you open a PR. Fill in every section that
applies. Delete sections that don't apply — do not leave placeholder comments in a submitted PR.

**Summary** — Required. One to three sentences. What changed and why.

**Packages affected** — Required. Every package touched must be listed. This makes it immediately
clear to anyone reading the PR which packages are affected and what kind of change it is.

**What's included** — Required for `feat` and `fix` PRs.

- For `feat`: a table of what was added, matching the format in the first PR
- For `fix`: a bullet list of issues addressed

**Design decisions** — Optional. Only include if a decision was non-obvious or alternatives were
considered and rejected. Keep it concise.

**Testing** — Required for `feat` and `fix` PRs. Describe what was tested and what edge cases were
covered. Omit for `docs`, `chore`, `deps`.

**Checklist** — Required. All boxes must be checked before requesting merge.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/). Same `type(scope):` format as
PR titles. Each commit should represent one logical change. Commits are squash-merged — the PR title
becomes the merge commit message.

## Branch naming

```
feat/[description]     — new feature or utility
fix/[description]      — bug fix
chore/[description]    — tooling or config
docs/[description]     — documentation only
```

Examples: `feat/utils-groupby`, `fix/clonedeep-undefined-props`, `chore/update-nx`
