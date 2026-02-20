import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

function findWorkspaceRoot(startDir: string): string {
  let currentDir = resolve(startDir)

  while (true) {
    if (existsSync(resolve(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir
    }

    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) {
      return resolve(startDir)
    }
    currentDir = parentDir
  }
}

function parseFallbackEnv(content: string) {
  const lines = content.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const equalsIndex = line.indexOf('=')
    if (equalsIndex <= 0) continue

    const key = line.slice(0, equalsIndex).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    if (Object.prototype.hasOwnProperty.call(process.env, key)) continue

    let value = line.slice(equalsIndex + 1).trim()
    const hasDoubleQuotes = value.startsWith('"') && value.endsWith('"')
    const hasSingleQuotes = value.startsWith("'") && value.endsWith("'")
    if (hasDoubleQuotes || hasSingleQuotes) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

export function loadRootEnv() {
  const workspaceRoot = findWorkspaceRoot(process.cwd())
  const envPath = resolve(workspaceRoot, '.env')

  if (!existsSync(envPath)) {
    return
  }

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath)
    return
  }

  parseFallbackEnv(readFileSync(envPath, 'utf8'))
}

loadRootEnv()
