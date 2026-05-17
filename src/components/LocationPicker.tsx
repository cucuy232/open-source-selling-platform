import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  position?: [number, number];
  onPositionChange: (pos: [number, number]) => void;
  height?: string;
}

const LocationMarker = ({ position, onPositionChange }: { position?: [number, number], onPositionChange: (pos: [number, number]) => void }) => {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  React.useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ position, onPositionChange, height = '200px' }) => {
  const defaultCenter: [number, number] = [20.5937, 78.9629]; // Center of India
  const center = position || defaultCenter;

  return (
    <div style={{ height, width: '100%', border: '1px solid var(--border-color)', position: 'relative', zIndex: 1, marginBottom: '10px' }}>
      <MapContainer center={center} zoom={position ? 13 : 4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onPositionChange={onPositionChange} />
      </MapContainer>
      <div style={{ fontSize: '0.7rem', marginTop: '5px', color: '#666', fontStyle: 'italic' }}>
        Click on the map to set the exact item location
      </div>
    </div>
  );
};

export default LocationPicker;
