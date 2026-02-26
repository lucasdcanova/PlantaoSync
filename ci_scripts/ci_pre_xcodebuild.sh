#!/bin/bash
set -euo pipefail

log() {
  echo "[ci_pre_xcodebuild] $*" >&2
}

REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(pwd)}"
cd "$REPO_ROOT/apps/mobile/ios"

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

if [ ! -f Podfile.lock ] || [ ! -d Pods ]; then
  log "Pods ausentes, executando pod install"
  pod install
else
  log "Pods OK"
fi

log "ci_pre_xcodebuild finished"
