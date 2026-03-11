'use client'

import { useEffect } from 'react'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { divIcon, type DragEndEvent, type LeafletMouseEvent } from 'leaflet'

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
const GEOFENCE_MARKER_ICON = divIcon({
  className: 'geofence-marker',
  html: `
    <div style="width:40px;height:52px;display:flex;align-items:flex-start;justify-content:center;">
      <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 3C10.611 3 3 10.611 3 20C3 32.111 18.098 48.144 19.086 49.182C19.58 49.7 20.42 49.7 20.914 49.182C21.902 48.144 37 32.111 37 20C37 10.611 29.389 3 20 3Z" fill="#14B8A6" stroke="#0F172A" stroke-width="3"/>
        <circle cx="20" cy="20" r="6.5" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [40, 52],
  iconAnchor: [20, 50],
})

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
  const lat = point?.lat
  const lng = point?.lng

  useEffect(() => {
    if (lat === undefined || lng === undefined) return

    const nextZoom = Math.max(map.getZoom(), 15)
    map.flyTo([lat, lng], nextZoom, { duration: 0.35 })
  }, [map, lat, lng])

  return null
}

function DraggableMarker({
  point,
  onPointChange,
}: {
  point: MapPoint
  onPointChange: (point: MapPoint) => void
}) {
  return (
    <Marker
      position={[point.lat, point.lng]}
      draggable
      icon={GEOFENCE_MARKER_ICON}
      eventHandlers={{
        dragend(event: DragEndEvent) {
          const marker = event.target
          const nextPoint = marker.getLatLng()
          onPointChange({
            lat: nextPoint.lat,
            lng: nextPoint.lng,
          })
        },
      }}
    />
  )
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
          <DraggableMarker point={point} onPointChange={onPointChange} />
        </>
      ) : null}
    </MapContainer>
  )
}
