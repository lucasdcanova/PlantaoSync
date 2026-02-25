#!/bin/bash
set -euo pipefail

log() {
  echo "[ci_post_clone] $*"
}

fail() {
  echo "[ci_post_clone] ERROR: $*" >&2
  exit 1
}

find_brew() {
  if command -v brew >/dev/null 2>&1; then
    command -v brew
    return 0
  fi

  if [ -x /opt/homebrew/bin/brew ]; then
    echo /opt/homebrew/bin/brew
    return 0
  fi

  if [ -x /usr/local/bin/brew ]; then
    echo /usr/local/bin/brew
    return 0
  fi

  return 1
}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$SCRIPT_DIR/.." && pwd)}"
IOS_DIR="$REPO_ROOT/apps/mobile/ios"
PODS_XCCONFIG="Pods/Target Support Files/Pods-CONFIRMAPLANTO/Pods-CONFIRMAPLANTO.release.xcconfig"

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

log "Repository root: $REPO_ROOT"
cd "$REPO_ROOT"

if ! command -v node >/dev/null 2>&1; then
  BREW_BIN="$(find_brew || true)"
  [ -n "${BREW_BIN:-}" ] || fail "Node.js is not available and Homebrew was not found."

  log "Node.js is not available. Installing node@20 with Homebrew ($BREW_BIN)"
  "$BREW_BIN" install node@20

  NODE20_PREFIX="$("$BREW_BIN" --prefix node@20 2>/dev/null || true)"
  if [ -n "$NODE20_PREFIX" ] && [ -d "$NODE20_PREFIX/bin" ]; then
    export PATH="$NODE20_PREFIX/bin:$PATH"
  fi

  if ! command -v node >/dev/null 2>&1; then
    fail "Node.js is still unavailable after Homebrew install."
  fi
fi

NODE_BIN="$(command -v node)"
log "Node version: $(node -v)"
log "Node binary: $NODE_BIN"

if command -v corepack >/dev/null 2>&1; then
  corepack enable || true
  PNPM_VERSION="$(node -p "try { const pm = require('./package.json').packageManager || ''; const m = pm.match(/^pnpm@(.+)$/); m ? m[1] : ''; } catch (_) { '' }")"
  if [ -n "$PNPM_VERSION" ]; then
    log "Activating pnpm@$PNPM_VERSION via corepack"
    corepack prepare "pnpm@$PNPM_VERSION" --activate
  fi
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[ci_post_clone] ERROR: pnpm was not found after corepack activation." >&2
  exit 1
fi

log "pnpm version: $(pnpm --version)"
log "Installing JavaScript dependencies (monorepo)"
pnpm install --frozen-lockfile

if [ ! -d "$IOS_DIR" ]; then
  fail "iOS directory not found: $IOS_DIR"
fi

cd "$IOS_DIR"

if ! command -v pod >/dev/null 2>&1; then
  fail "CocoaPods (pod) is not available on this build image."
fi

# Ensure Xcode build phases can find the same Node binary in CI.
printf 'export NODE_BINARY="%s"\n' "$NODE_BIN" > .xcode.env.local
log "Wrote ios/.xcode.env.local with NODE_BINARY=$NODE_BIN"

log "CocoaPods version: $(pod --version)"
log "Running pod install"
pod install --repo-update

if [ ! -f "$PODS_XCCONFIG" ]; then
  fail "Expected CocoaPods xcconfig was not generated: $IOS_DIR/$PODS_XCCONFIG"
fi

log "Validated generated file: $IOS_DIR/$PODS_XCCONFIG"
log "ci_post_clone finished successfully"
