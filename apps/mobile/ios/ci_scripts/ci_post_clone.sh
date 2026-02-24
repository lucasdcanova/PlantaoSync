#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$SCRIPT_DIR/../../../.." && pwd)}"

if [ -x "$REPO_ROOT/ci_scripts/ci_post_clone.sh" ]; then
  exec "$REPO_ROOT/ci_scripts/ci_post_clone.sh"
fi

exec /bin/bash "$REPO_ROOT/ci_scripts/ci_post_clone.sh"
