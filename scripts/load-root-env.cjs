const fs = require('node:fs')
const path = require('node:path')

function findWorkspaceRoot(startDir) {
  let currentDir = path.resolve(startDir)

  while (true) {
    if (fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      return path.resolve(startDir)
    }
    currentDir = parentDir
  }
}

function parseFallbackEnv(content) {
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

function loadRootEnv(startDir) {
  const workspaceRoot = findWorkspaceRoot(startDir)
  const envPath = path.join(workspaceRoot, '.env')

  if (!fs.existsSync(envPath)) {
    return { loaded: false, envPath, workspaceRoot }
  }

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envPath)
  } else {
    parseFallbackEnv(fs.readFileSync(envPath, 'utf8'))
  }

  return { loaded: true, envPath, workspaceRoot }
}

module.exports = {
  findWorkspaceRoot,
  loadRootEnv,
}
