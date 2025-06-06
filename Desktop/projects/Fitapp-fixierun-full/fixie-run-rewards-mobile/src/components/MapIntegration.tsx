import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapIntegrationProps {
  onPositionUpdate: (lat: number, lng: number) => void;
}

const MapIntegration: React.FC<MapIntegrationProps> = ({ positions, onPositionUpdate }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    // Initialize map
    mapRef.current = L.map('map-container', {
      zoomControl: false,
      attributionControl: false
    }).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);

    // Initialize polyline
    polylineRef.current = L.polyline([], { color: '#4a90e2' }).addTo(mapRef.current);

    // Initialize marker
    const icon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    
    markerRef.current = L.marker([51.505, -0.09], { icon })
      .addTo(mapRef.current)
      .bindPopup('Votre position actuelle');

    // Geolocation tracking
    navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      onPositionUpdate(latitude, longitude);
      
      if (mapRef.current && markerRef.current) {
        const newPos = [latitude, longitude] as L.LatLngExpression;
        markerRef.current.setLatLng(newPos);
        mapRef.current.panTo(newPos);
        
        if (polylineRef.current) {
          const currentPath = polylineRef.current.getLatLngs();
          currentPath.push(newPos);
          polylineRef.current.setLatLngs(currentPath);
        }
      }
    }, null, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    });

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return <div id="map-container" style={{ height: '400px', width: '100%' }} />;
};

export default MapIntegration;
