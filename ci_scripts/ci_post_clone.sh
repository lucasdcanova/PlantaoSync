#!/bin/bash
set -euo pipefail

log() {
  echo "[ci_post_clone] $*"
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
  echo "[ci_post_clone] ERROR: Node.js is not available on this build image." >&2
  exit 1
fi

log "Node version: $(node -v)"

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
  echo "[ci_post_clone] ERROR: iOS directory not found: $IOS_DIR" >&2
  exit 1
fi

cd "$IOS_DIR"

if ! command -v pod >/dev/null 2>&1; then
  echo "[ci_post_clone] ERROR: CocoaPods (pod) is not available on this build image." >&2
  exit 1
fi

log "CocoaPods version: $(pod --version)"
log "Running pod install"
pod install --repo-update

if [ ! -f "$PODS_XCCONFIG" ]; then
  echo "[ci_post_clone] ERROR: Expected CocoaPods xcconfig was not generated: $IOS_DIR/$PODS_XCCONFIG" >&2
  exit 1
fi

log "Validated generated file: $IOS_DIR/$PODS_XCCONFIG"
log "ci_post_clone finished successfully"
