import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FeatureCollection, Point } from 'geojson';
import { Restaurant } from '../common/types.ts';

mapboxgl.accessToken = String(import.meta.env.VITE_MAPBOX_TOKEN);

interface Coordinates {
  longitude: number;
  latitude: number;
  accuracy?: string;
  routable_points?: { name?: string; longitude: number; latitude: number }[];
}

interface Properties {
  mapbox_id: string;
  feature_type:
    | 'country'
    | 'region'
    | 'postcode'
    | 'district'
    | 'place'
    | 'locality'
    | 'neighborhood'
    | 'street'
    | 'address';
  name: string;
  name_preferred?: string;
  full_address?: string;
  coordinates: Coordinates;
}

interface BatchRequestBodyFragment {
  types: string[];
  q: string;
  bbox: [number, number, number, number];
  limit: number;
}

interface BatchResponseBody {
  batch: FeatureCollection<Point, Properties>[];
}

interface MapProps {
  restaurants: Restaurant[];
  activeId: string | null;
  onMarkerClick: (name: string) => void;
}

export default function Map({
  restaurants,
  activeId,
  onMarkerClick
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markersRef = useRef<
    Record<string, { el: HTMLButtonElement; lngLat: [number, number] }>
  >({});

  useEffect(() => {
    if (!mapContainer.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.350616, 47.6206],
      zoom: 10
    });

    newMap.on('wheel', (event) => {
      if (
        event.originalEvent.ctrlKey ||
        event.originalEvent.metaKey ||
        event.originalEvent.altKey
      ) {
        return;
      }
      event.preventDefault();
    });
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-left');

    setMap(newMap);
    return () => newMap.remove();
  }, []);

  useEffect(() => {
    if (!map) return;

    const fetchCoordinates = async () => {
      try {
        const requestBody: BatchRequestBodyFragment[] = restaurants.map(
          (r): BatchRequestBodyFragment => ({
            types: ['address'],
            q: r.address,
            bbox: [-122.5, 47, -122, 48],
            limit: 1
          })
        );

        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/batch?access_token=${mapboxgl.accessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          }
        );

        const responseBody = (await response.json()) as BatchResponseBody;

        responseBody.batch.forEach((featureCollection, index) => {
          if (
            featureCollection &&
            Array.isArray(featureCollection.features) &&
            featureCollection.features.length > 0
          ) {
            const [longitude, latitude] =
              featureCollection.features[0].geometry.coordinates;
            const restaurant = restaurants[index];

            const el = document.createElement('button');
            el.className =
              'w-7 h-7 rounded-full text-white text-xs font-bold border-2 border-white shadow-md cursor-pointer bg-zinc-800 hover:bg-[var(--md-sys-color-on-primary-container)] transition-colors flex items-center justify-center';
            el.textContent = String(index + 1);
            el.addEventListener('click', () => onMarkerClick(restaurant.name));

            new mapboxgl.Marker({ element: el })
              .setLngLat([longitude, latitude])
              .addTo(map);

            markersRef.current[restaurant.name] = {
              el,
              lngLat: [longitude, latitude]
            };
          } else {
            console.warn(`No features for address at index ${index}`);
          }
        });
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    fetchCoordinates().catch(console.error);
    // restaurants and onMarkerClick are stable (static data + stable callback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([name, { el }]) => {
      if (name === activeId) {
        el.classList.remove('bg-zinc-800');
        el.classList.add(
          'bg-[var(--md-sys-color-primary)]',
          'scale-110'
        );
        el.style.zIndex = '1';
      } else {
        el.classList.remove(
          'bg-[var(--md-sys-color-primary)]',
          'scale-110'
        );
        el.classList.add('bg-zinc-800');
        el.style.zIndex = '';
      }
    });

    if (activeId && map) {
      const active = markersRef.current[activeId];
      if (active) {
        map.flyTo({ center: active.lngLat, zoom: 14, duration: 800 });
      }
    }
  }, [activeId, map]);

  return (
    <div className="map-container sticky left-auto right-0 top-20 z-10 h-[calc(100vh-8rem)] w-3/5">
      <div className="m-4 h-full overflow-hidden">
        <div ref={mapContainer} className="h-full w-full" />
      </div>
    </div>
  );
}
