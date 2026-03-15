#!/bin/sh
set -e

echo "🔧 Setting up aklabs..."

# ── Node version check ────────────────────────────────────────────────────────
REQUIRED_NODE="20.18.1"
CURRENT_NODE=$(node --version 2>/dev/null | sed 's/v//')

if [ "$CURRENT_NODE" != "$REQUIRED_NODE" ]; then
  echo "❌ Node version mismatch."
  echo "   Required: $REQUIRED_NODE"
  echo "   Current:  $CURRENT_NODE"
  echo ""
  echo "   Run: nvm install $REQUIRED_NODE && nvm use $REQUIRED_NODE"
  exit 1
fi

echo "✅ Node $CURRENT_NODE"

# ── pnpm check ────────────────────────────────────────────────────────────────
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found. Enable it with: corepack enable"
  exit 1
fi

echo "✅ pnpm $(pnpm --version)"

# ── Install dependencies ──────────────────────────────────────────────────────
echo "📦 Installing dependencies..."
pnpm install

# ── Husky setup ───────────────────────────────────────────────────────────────
echo "🪝 Setting up git hooks..."
pnpm run prepare

# ── gitleaks check (optional — secretlint covers baseline) ───────────────────
if ! command -v gitleaks &> /dev/null; then
  echo "ℹ️  gitleaks not installed — secretlint covers baseline secret detection."
  echo "   For deeper scanning install: brew install gitleaks"
else
  echo "✅ gitleaks $(gitleaks version)"
fi

echo ""
echo "✅ Setup complete. You're ready to go."
