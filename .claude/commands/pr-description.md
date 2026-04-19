---
description: Generate a PR description from the current branch diff following the repo template
allowed-tools: Bash, Read
---

1. Run `git log main...HEAD --oneline` and `git diff main...HEAD -- packages/`.
2. Read `CONTRIBUTING.md` and `.github/pull_request_template.md`.
3. Fill in each section following CONTRIBUTING.md rules.
4. Output as a markdown code block.

Only include what is evident from the diff. Omit sections that cannot be filled rather than guess.
