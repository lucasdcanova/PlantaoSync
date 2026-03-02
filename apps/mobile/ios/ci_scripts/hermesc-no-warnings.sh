#!/bin/sh
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_HERMESC="$SCRIPT_DIR/../Pods/hermes-engine/destroot/bin/hermesc"

if [ "${HERMES_REAL_CLI_PATH:-}" != "" ]; then
  REAL_HERMESC="$HERMES_REAL_CLI_PATH"
elif [ "${PODS_ROOT:-}" != "" ]; then
  REAL_HERMESC="$PODS_ROOT/hermes-engine/destroot/bin/hermesc"
else
  REAL_HERMESC="$DEFAULT_HERMESC"
fi

if [ ! -x "$REAL_HERMESC" ]; then
  echo "error: Hermes compiler not found at '$REAL_HERMESC'" >&2
  exit 1
fi

# Suppress Hermes undefined-global diagnostics during iOS bundle compilation.
exec "$REAL_HERMESC" -w "$@"
