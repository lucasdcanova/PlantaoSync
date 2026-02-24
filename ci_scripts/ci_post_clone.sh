#!/bin/sh
set -e

cd "$CI_PRIMARY_REPOSITORY_PATH"

# JS deps (monorepo)
corepack enable || true
pnpm install --frozen-lockfile

# iOS deps
cd apps/mobile/ios
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pod install

echo "ci_post_clone finished"
