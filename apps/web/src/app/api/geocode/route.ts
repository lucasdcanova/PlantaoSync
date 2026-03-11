import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
const REQUEST_HEADERS = {
  Accept: 'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'User-Agent': 'PlantaoSync/1.0 (+https://github.com/lucasdcanova/PlantaoSync)',
}

type NominatimAddress = {
  amenity?: string
  building?: string
  road?: string
  house_number?: string
  suburb?: string
  neighbourhood?: string
  quarter?: string
  city?: string
  town?: string
  municipality?: string
  state?: string
  country?: string
  hospital?: string
}

type NominatimResult = {
  lat: string
  lon: string
  display_name: string
  name?: string
  address?: NominatimAddress
}

function buildPrimaryText(result: NominatimResult) {
  return (
    result.name?.trim() ||
    result.address?.amenity ||
    result.address?.hospital ||
    result.address?.building ||
    result.address?.road ||
    result.display_name.split(',')[0]?.trim() ||
    'Local no mapa'
  )
}

function buildSecondaryText(address?: NominatimAddress) {
  if (!address) return ''

  const roadLine =
    address.road && address.house_number
      ? `${address.road}, ${address.house_number}`
      : address.road

  return [
    roadLine,
    address.suburb || address.neighbourhood || address.quarter,
    address.city || address.town || address.municipality,
    address.state,
    address.country,
  ]
    .filter(Boolean)
    .join(' • ')
}

function mapResult(result: NominatimResult) {
  const lat = Number(result.lat)
  const lng = Number(result.lon)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  const secondaryText = buildSecondaryText(result.address)

  return {
    lat,
    lng,
    displayName: result.display_name,
    primaryText: buildPrimaryText(result),
    secondaryText: secondaryText || result.display_name,
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()
  const lat = Number(request.nextUrl.searchParams.get('lat'))
  const lng = Number(request.nextUrl.searchParams.get('lng'))

  try {
    if (query) {
      if (query.length < 3) {
        return NextResponse.json(
          { message: 'Informe pelo menos 3 caracteres para buscar um endereço.' },
          { status: 400 },
        )
      }

      const searchParams = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'br',
      })

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${searchParams.toString()}`, {
        headers: REQUEST_HEADERS,
        cache: 'no-store',
      })

      if (!response.ok) {
        return NextResponse.json(
          { message: 'Nao foi possivel buscar enderecos agora.' },
          { status: response.status },
        )
      }

      const payload = (await response.json()) as NominatimResult[]
      const results = payload.map(mapResult).filter(Boolean)

      return NextResponse.json({ results })
    }

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const searchParams = new URLSearchParams({
        lat: lat.toFixed(6),
        lon: lng.toFixed(6),
        format: 'jsonv2',
        addressdetails: '1',
        zoom: '18',
      })

      const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${searchParams.toString()}`, {
        headers: REQUEST_HEADERS,
        cache: 'no-store',
      })

      if (!response.ok) {
        return NextResponse.json(
          { message: 'Nao foi possivel resolver o endereco deste ponto agora.' },
          { status: response.status },
        )
      }

      const payload = (await response.json()) as NominatimResult
      const result = mapResult(payload)

      return NextResponse.json({ result })
    }

    return NextResponse.json(
      { message: 'Informe um endereco ou coordenadas para geocodificacao.' },
      { status: 400 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Falha inesperada ao consultar geocodificacao.',
      },
      { status: 500 },
    )
  }
}
