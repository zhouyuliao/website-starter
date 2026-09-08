'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AttributionControl, MapContainer, Marker, TileLayer } from 'react-leaflet'
import { mapCenter, stations } from '@/lib/data'

const stationIcon = (name: string) =>
  L.divIcon({
    className: 'leaflet-station-icon',
    html: `<div class="mk"><div class="mk-pin"><span>砼</span></div><div class="mk-label">${name}</div></div>`,
    iconSize: [90, 54],
    iconAnchor: [45, 32],
  })

const userIcon = L.divIcon({
  className: '',
  html: '<div class="user-dot"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

export default function StationMap() {
  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      {/* 高德矢量底图，与小程序地图观感一致 */}
      <TileLayer
        url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
        subdomains={['1', '2', '3', '4']}
        attribution="&copy; 高德地图 AutoNavi"
        maxZoom={18}
      />
      <AttributionControl position="bottomleft" prefix={false} />
      <Marker position={mapCenter} icon={userIcon} />
      {stations.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={stationIcon(s.name)} />
      ))}
    </MapContainer>
  )
}
