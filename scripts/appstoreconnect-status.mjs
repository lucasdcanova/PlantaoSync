#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'

const API_BASE = 'https://api.appstoreconnect.apple.com/v1'

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function parseArgs(argv) {
  const args = {
    bundleId:
      process.env.APPSTORE_CONNECT_BUNDLE_ID ||
      process.env.ASC_BUNDLE_ID ||
      'com.confirmaplantao.app',
    json: false,
  }

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--bundle-id' && argv[i + 1]) {
      args.bundleId = argv[i + 1]
      i += 1
      continue
    }

    if (arg === '--json') {
      args.json = true
      continue
    }

    if (arg === '--help' || arg === '-h') {
      args.help = true
      continue
    }
  }

  return args
}

function printHelp() {
  console.log(`Uso:
  node scripts/appstoreconnect-status.mjs [--bundle-id <bundle>] [--json]

Variaveis de ambiente necessarias:
  APPSTORE_CONNECT_ISSUER_ID (ou ASC_ISSUER_ID)
  APPSTORE_CONNECT_KEY_ID    (ou ASC_KEY_ID)
  APPSTORE_CONNECT_KEY_PATH  (ou ASC_PRIVATE_KEY_PATH)

Opcional:
  APPSTORE_CONNECT_BUNDLE_ID (ou ASC_BUNDLE_ID)
`)
}

function getRequiredEnv() {
  const issuerId =
    process.env.APPSTORE_CONNECT_ISSUER_ID || process.env.ASC_ISSUER_ID || ''
  const keyId = process.env.APPSTORE_CONNECT_KEY_ID || process.env.ASC_KEY_ID || ''
  const keyPath =
    process.env.APPSTORE_CONNECT_KEY_PATH || process.env.ASC_PRIVATE_KEY_PATH || ''

  const missing = []
  if (!issuerId) missing.push('APPSTORE_CONNECT_ISSUER_ID')
  if (!keyId) missing.push('APPSTORE_CONNECT_KEY_ID')
  if (!keyPath) missing.push('APPSTORE_CONNECT_KEY_PATH')

  if (missing.length > 0) {
    throw new Error(`Variaveis ausentes: ${missing.join(', ')}`)
  }

  return { issuerId, keyId, keyPath }
}

function generateToken({ issuerId, keyId, keyPath }) {
  const privateKey = readFileSync(keyPath, 'utf8')
  const now = Math.floor(Date.now() / 1000)

  const header = {
    alg: 'ES256',
    kid: keyId,
    typ: 'JWT',
  }

  const payload = {
    iss: issuerId,
    aud: 'appstoreconnect-v1',
    exp: now + 20 * 60,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const signer = createSign('SHA256')
  signer.update(signingInput)
  signer.end()

  const signature = signer.sign({
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  })

  return `${signingInput}.${base64UrlEncode(signature)}`
}

async function ascFetch(token, path, searchParams = {}) {
  const url = new URL(`${API_BASE}${path}`)
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      url.searchParams.set(key, String(value))
    }
  })

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    body = { raw: text }
  }

  if (!res.ok) {
    const apiError = body?.errors?.[0]
    const details = apiError
      ? `${apiError.status || res.status} ${apiError.code || ''} ${apiError.title || ''} ${apiError.detail || ''}`.trim()
      : `${res.status} ${res.statusText}`
    throw new Error(`App Store Connect API error em ${path}: ${details}`)
  }

  return body
}

function mapIncluded(items = []) {
  const map = new Map()
  for (const item of items) {
    map.set(`${item.type}:${item.id}`, item)
  }
  return map
}

async function loadStatus(token, bundleId) {
  const appsResponse = await ascFetch(token, '/apps', {
    'filter[bundleId]': bundleId,
    limit: 1,
  })

  const app = appsResponse?.data?.[0]
  if (!app) {
    throw new Error(`Nenhum app encontrado com bundleId '${bundleId}'`)
  }

  const appId = app.id

  const [buildsResponse, versionsResponse] = await Promise.all([
    ascFetch(token, '/builds', {
      'filter[app]': appId,
      include: 'preReleaseVersion,buildBetaDetail,appStoreVersion',
      sort: '-uploadedDate',
      limit: 10,
    }),
    ascFetch(token, `/apps/${appId}/appStoreVersions`, {
      limit: 10,
      include: 'build',
    }),
  ])

  const includedMap = mapIncluded(buildsResponse?.included)
  const versionIncludedMap = mapIncluded(versionsResponse?.included)

  const builds = (buildsResponse?.data || []).map((build) => {
    const attrs = build.attributes || {}
    const preReleaseRel = build.relationships?.preReleaseVersion?.data
    const betaDetailRel = build.relationships?.buildBetaDetail?.data
    const appStoreVersionRel = build.relationships?.appStoreVersion?.data

    const preRelease = preReleaseRel
      ? includedMap.get(`${preReleaseRel.type}:${preReleaseRel.id}`)
      : undefined
    const betaDetail = betaDetailRel
      ? includedMap.get(`${betaDetailRel.type}:${betaDetailRel.id}`)
      : undefined
    const appStoreVersion = appStoreVersionRel
      ? includedMap.get(`${appStoreVersionRel.type}:${appStoreVersionRel.id}`)
      : undefined

    const shortVersion =
      preRelease?.attributes?.version ||
      attrs.shortVersion ||
      attrs.versionString ||
      attrs.cfBundleShortVersionString ||
      attrs.version ||
      '-'
    const buildNumber = attrs.buildNumber || attrs.version || attrs.cfBundleVersion || '-'

    return {
      id: build.id,
      version: shortVersion,
      buildNumber,
      uploadedDate: attrs.uploadedDate,
      processingState: attrs.processingState,
      expired: attrs.expired,
      minOsVersion: attrs.minOsVersion,
      preReleaseVersion: preRelease?.attributes?.version,
      testflightInternalState:
        betaDetail?.attributes?.internalBuildState || null,
      testflightExternalState:
        betaDetail?.attributes?.externalBuildState || null,
      appStoreVersionState: appStoreVersion?.attributes?.appStoreState || null,
      appStoreVersionString: appStoreVersion?.attributes?.versionString || null,
    }
  })

  const appStoreVersions = (versionsResponse?.data || []).map((version) => {
    const attrs = version.attributes || {}
    const buildRel = version.relationships?.build?.data
    const linkedBuild = buildRel
      ? versionIncludedMap.get(`${buildRel.type}:${buildRel.id}`)
      : undefined

    return {
      id: version.id,
      platform: attrs.platform,
      versionString: attrs.versionString,
      appStoreState: attrs.appStoreState,
      createdDate: attrs.createdDate,
      releaseType: attrs.releaseType || null,
      linkedBuildNumber: linkedBuild?.attributes?.buildNumber || null,
      linkedBuildVersion: linkedBuild?.attributes?.version || null,
    }
  })

  return {
    checkedAt: new Date().toISOString(),
    app: {
      id: app.id,
      name: app.attributes?.name,
      bundleId: app.attributes?.bundleId,
      sku: app.attributes?.sku,
    },
    builds,
    appStoreVersions,
  }
}

function printHuman(result) {
  console.log('App Store Connect status')
  console.log(`- checkedAt: ${result.checkedAt}`)
  console.log(
    `- app: ${result.app.name} (${result.app.bundleId}) [id=${result.app.id}]`,
  )

  console.log('\nBuilds (ultimos 10):')
  if (!result.builds.length) {
    console.log('- nenhum build encontrado')
  } else {
    for (const build of result.builds) {
      console.log(
        `- ${build.version} (${build.buildNumber}) | processing=${build.processingState} | internal=${build.testflightInternalState ?? '-'} | external=${build.testflightExternalState ?? '-'} | appStore=${build.appStoreVersionState ?? '-'} | uploaded=${build.uploadedDate ?? '-'}`,
      )
    }
  }

  console.log('\nApp Store versions (ultimas 10):')
  if (!result.appStoreVersions.length) {
    console.log('- nenhuma versao encontrada')
  } else {
    for (const version of result.appStoreVersions) {
      const linkedBuild = version.linkedBuildNumber
        ? `${version.linkedBuildVersion} (${version.linkedBuildNumber})`
        : '-'
      console.log(
        `- ${version.versionString} | state=${version.appStoreState} | build=${linkedBuild} | created=${version.createdDate ?? '-'}`,
      )
    }
  }
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    printHelp()
    return
  }

  const env = getRequiredEnv()
  const token = generateToken(env)
  const status = await loadStatus(token, args.bundleId)

  if (args.json) {
    console.log(JSON.stringify(status, null, 2))
    return
  }

  printHuman(status)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
