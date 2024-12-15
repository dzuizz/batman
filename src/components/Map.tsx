'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { InfrastructureData } from '@/types/infrastructure';
import { Card } from './ui/card';

// Define different icons for different infrastructure types
const createIcon = (color: string) => L.icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
            <circle cx="12" cy="12" r="10" />
        </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});

const icons = {
    road: createIcon('#3B82F6'),     // blue
    water: createIcon('#06B6D4'),    // cyan
    power: createIcon('#F59E0B'),    // amber
    government: createIcon('#10B981') // emerald
};

const userIcon = L.icon({
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
        if (mapRef.current) {
            mapRef.current.remove();
        }

        const container = L.DomUtil.get('map') as HTMLElement;
        if (container) {
            (container as unknown as { _leaflet_id: null })._leaflet_id = null;
        }

        const map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            dragging: true
        }).setView(center, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add user location marker
        L.marker(center, { icon: userIcon })
            .addTo(map)
            .bindPopup('<span class="text-black">Anda di sini</span>')
            .openPopup();

        // Add infrastructure markers
        if (infrastructureData) {
            // Add road infrastructure
            if (infrastructureData.roads) {
                [...infrastructureData.roads.major_highways, ...infrastructureData.roads.arterial_roads].forEach(road => {
                    road.coordinates.forEach(coord => {
                        L.marker([coord.lat, coord.lng], { icon: icons.road })
                            .addTo(map)
                            .bindPopup(`<div class="text-black">
                                <b>${road.name}</b><br/>
                                Status: ${road.status}<br/>
                                Traffic: ${road.trafficDensity}%
                            </div>`);
                    });
                });
            }

            // Add water infrastructure
            if (infrastructureData.water) {
                [...infrastructureData.water.main_pipelines, ...infrastructureData.water.treatment_plants].forEach(pipeline => {
                    pipeline.coordinates.forEach(coord => {
                        L.marker([coord.lat, coord.lng], { icon: icons.water })
                            .addTo(map)
                            .bindPopup(`<div class="text-black">
                                <b>${pipeline.name}</b><br/>
                                Status: ${pipeline.status}<br/>
                                Pressure: ${pipeline.pressure} PSI
                            </div>`);
                    });
                });
            }

            // Add power infrastructure
            if (infrastructureData.power) {
                [...infrastructureData.power.substations, ...infrastructureData.power.transmission_lines].forEach(power => {
                    power.coordinates.forEach(coord => {
                        L.marker([coord.lat, coord.lng], { icon: icons.power })
                            .addTo(map)
                            .bindPopup(`<div class="text-black">
                                <b>${power.name}</b><br/>
                                Status: ${power.status}<br/>
                                Capacity: ${power.capacity} MW
                            </div>`);
                    });
                });
            }
        }

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
        <Card className="text-black dark:text-slate-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-violet-200/50 dark:border-violet-800/50">
            <div
                id="map"
                className="text-black w-full h-[400px] rounded-xl overflow-hidden"
                style={{
                    position: 'relative',
                    zIndex: 0
                }}
            />
        </Card>
    );
};

export default Map;