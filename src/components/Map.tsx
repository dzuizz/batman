'use client';

import { useEffect, useRef } from 'react';
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { InfrastructureData } from '@/types/infrastructure';

const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    center: [number, number];
    infrastructureData: InfrastructureData | null;
}

const Map = ({ center, infrastructureData }: MapProps) => {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapRef.current)
            mapRef.current.remove();

        const container = L.DomUtil.get('map') as any;
        if (container != null) {
            container._leaflet_id = null;
        }

        const map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            dragging: true
        }).setView(center, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add marker with popup
        L.marker(center, { icon })
            .addTo(map)
            .bindPopup('<span class="text-black">Anda di sini</span>')
            .openPopup();

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.off();
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center, infrastructureData]);

    return (
        <div
            id="map"
            className="text-black w-full h-[400px] rounded-xl overflow-hidden"
            style={{
                position: 'relative',
                zIndex: 0
            }}
        />
    );
};

export default Map;