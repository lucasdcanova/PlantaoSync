#!/usr/bin/env node
const { spawn } = require('node:child_process')
const { loadRootEnv } = require('./load-root-env.cjs')

loadRootEnv(process.cwd())

const [, , command, ...args] = process.argv

if (!command) {
  console.error('Usage: node scripts/with-root-env.cjs <command> [...args]')
  process.exit(1)
}

const child = spawn(command, args, {
  stdio: 'inherit',
  env: process.env,
})

child.on('error', (error) => {
  console.error(error.message)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
