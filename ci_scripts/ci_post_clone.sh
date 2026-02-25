#!/bin/bash
set -euo pipefail

log() {
  echo "[ci_post_clone] $*" >&2
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

retry_command() {
  local max_attempts="$1"
  local sleep_seconds="$2"
  shift 2

  local attempt=1
  while [ "$attempt" -le "$max_attempts" ]; do
    if "$@"; then
      return 0
    fi

    if [ "$attempt" -lt "$max_attempts" ]; then
      log "Command failed (attempt ${attempt}/${max_attempts}); retrying in ${sleep_seconds}s: $*"
      sleep "$sleep_seconds"
    fi

    attempt=$((attempt + 1))
  done

  return 1
}

ensure_pnpm_available() {
  local requested_version="$1"
  local npm_global_prefix

  if command -v corepack >/dev/null 2>&1; then
    corepack enable || true

    if [ -n "$requested_version" ]; then
      log "Activating pnpm@${requested_version} via corepack"
      if ! retry_command 3 10 corepack prepare "pnpm@${requested_version}" --activate; then
        log "Corepack prepare failed; falling back to npm global install for pnpm@${requested_version}"
      fi
    fi
  fi

  if ! command -v pnpm >/dev/null 2>&1; then
    if [ -n "$requested_version" ]; then
      retry_command 3 10 npm install -g "pnpm@${requested_version}" || fail "Failed to install pnpm@${requested_version} via npm fallback."
    else
      retry_command 3 10 npm install -g pnpm || fail "Failed to install pnpm via npm fallback."
    fi

    npm_global_prefix="$(npm prefix -g 2>/dev/null || true)"
    if [ -n "$npm_global_prefix" ] && [ -d "$npm_global_prefix/bin" ]; then
      export PATH="$npm_global_prefix/bin:$PATH"
    fi
  fi

  command -v pnpm >/dev/null 2>&1 || fail "pnpm was not found after corepack/npm setup."
}

run_pod_install_with_retries() {
  local attempt=1
  local max_attempts=3

  while [ "$attempt" -le "$max_attempts" ]; do
    log "Running pod install (attempt ${attempt}/${max_attempts}, no repo update)"
    if pod install; then
      return 0
    fi

    if [ "$attempt" -lt "$max_attempts" ]; then
      log "pod install failed (attempt ${attempt}/${max_attempts}); retrying in 15s"
      sleep 15
    fi

    attempt=$((attempt + 1))
  done

  return 1
}

download_boost_tarball_if_needed() {
  local boost_version="1.83.0"
  local boost_file="boost_1_83_0.tar.bz2"
  local boost_sha256="6478edfe2f3305127cffe8caf73ea0176c53769f4bf1585be237eb30798c3b8e"
  local boost_url="https://archives.boost.io/release/${boost_version}/source/${boost_file}"
  local fastly_ip="199.232.15.52"
  local cache_dir="$REPO_ROOT/.xcode-cloud-cache"
  local local_path="$cache_dir/$boost_file"
  local tmp_path="$local_path.tmp"

  mkdir -p "$cache_dir"

  if [ -f "$local_path" ]; then
    local current_sha
    current_sha="$(shasum -a 256 "$local_path" | awk '{print $1}')"
    if [ "$current_sha" = "$boost_sha256" ]; then
      log "Using cached Boost archive: $local_path"
      printf '%s\n' "$local_path"
      return 0
    fi
    log "Cached Boost archive checksum mismatch, re-downloading"
    rm -f "$local_path"
  fi

  log "Downloading Boost archive from default URL"
  if curl -fL --retry 5 --retry-all-errors --connect-timeout 15 --max-time 900 \
    -o "$tmp_path" "$boost_url"; then
    :
  else
    log "Default Boost download failed; retrying with --resolve fallback (${fastly_ip})"
    rm -f "$tmp_path"
    curl -fL --retry 5 --retry-all-errors --connect-timeout 15 --max-time 900 \
      --resolve "archives.boost.io:443:${fastly_ip}" \
      -o "$tmp_path" "$boost_url"
  fi

  local downloaded_sha
  downloaded_sha="$(shasum -a 256 "$tmp_path" | awk '{print $1}')"
  [ "$downloaded_sha" = "$boost_sha256" ] || fail "Boost archive checksum mismatch: $downloaded_sha"

  mv "$tmp_path" "$local_path"
  log "Downloaded Boost archive to $local_path"
  printf '%s\n' "$local_path"
}

patch_react_native_boost_podspec_to_local_file() {
  local mobile_dir="$REPO_ROOT/apps/mobile"
  local rn_package_json
  local rn_dir
  local boost_podspec
  local boost_local_path
  local escaped_local_url

  rn_package_json="$(cd "$mobile_dir" && node --print "require.resolve('react-native/package.json')")"
  rn_dir="$(dirname "$rn_package_json")"
  boost_podspec="$rn_dir/third-party-podspecs/boost.podspec"
  [ -f "$boost_podspec" ] || fail "React Native boost podspec not found: $boost_podspec"

  boost_local_path="$(download_boost_tarball_if_needed)"
  escaped_local_url="file://${boost_local_path}"

  if grep -q "$escaped_local_url" "$boost_podspec"; then
    log "Boost podspec already patched to local archive"
    return 0
  fi

  perl -0pi -e "s#https://archives\\.boost\\.io/release/1\\.83\\.0/source/boost_1_83_0\\.tar\\.bz2#${escaped_local_url}#g" "$boost_podspec"

  grep -q "$escaped_local_url" "$boost_podspec" || fail "Failed to patch boost podspec to local archive"
  log "Patched React Native boost podspec to local archive (${boost_podspec})"
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

  export HOMEBREW_NO_AUTO_UPDATE=1
  export HOMEBREW_NO_INSTALL_CLEANUP=1
  export HOMEBREW_NO_ENV_HINTS=1
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

PNPM_VERSION="$(node -p "try { const pm = require('./package.json').packageManager || ''; const m = pm.match(/^pnpm@(.+)$/); m ? m[1] : ''; } catch (_) { '' }")"
ensure_pnpm_available "$PNPM_VERSION"

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

patch_react_native_boost_podspec_to_local_file

log "CocoaPods version: $(pod --version)"
run_pod_install_with_retries || fail "pod install failed after multiple attempts"

if [ ! -f "$PODS_XCCONFIG" ]; then
  fail "Expected CocoaPods xcconfig was not generated: $IOS_DIR/$PODS_XCCONFIG"
fi

log "Validated generated file: $IOS_DIR/$PODS_XCCONFIG"
log "ci_post_clone finished successfully"
