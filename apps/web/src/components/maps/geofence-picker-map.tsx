'use client'

import { useEffect } from 'react'
import type { LeafletMouseEvent } from 'leaflet'
import { Circle, CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'

type MapPoint = {
  lat: number
  lng: number
}

type GeofencePickerMapProps = {
  point: MapPoint | null
  radiusMeters: number
  onPointChange: (point: MapPoint) => void
}

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253]

function ClickHandler({ onPointChange }: { onPointChange: (point: MapPoint) => void }) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPointChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      })
    },
  })

  return null
}

function AutoCenter({ point }: { point: MapPoint | null }) {
  const map = useMap()

  useEffect(() => {
    if (!point) return

    const nextZoom = Math.max(map.getZoom(), 15)
    map.flyTo([point.lat, point.lng], nextZoom, { duration: 0.35 })
  }, [map, point])

  return null
}

export function GeofencePickerMap({ point, radiusMeters, onPointChange }: GeofencePickerMapProps) {
  const center: [number, number] = point ? [point.lat, point.lng] : BRAZIL_CENTER
  const safeRadius = Number.isFinite(radiusMeters) && radiusMeters > 0 ? radiusMeters : 180

  return (
    <MapContainer
      center={center}
      zoom={point ? 15 : 4}
      scrollWheelZoom
      className="h-[260px] w-full rounded-xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ClickHandler onPointChange={onPointChange} />
      <AutoCenter point={point} />

      {point ? (
        <>
          <Circle
            center={[point.lat, point.lng]}
            radius={safeRadius}
            pathOptions={{ color: '#0ea5a4', fillColor: '#2bb5ab', fillOpacity: 0.12, weight: 2 }}
          />
          <CircleMarker
            center={[point.lat, point.lng]}
            radius={7}
            pathOptions={{ color: '#0f172a', fillColor: '#2bb5ab', fillOpacity: 1, weight: 2 }}
          />
        </>
      ) : null}
    </MapContainer>
  )
}
