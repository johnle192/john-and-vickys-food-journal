import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Restaurant } from '../common/types.ts';

mapboxgl.accessToken = String(import.meta.env.VITE_MAPBOX_TOKEN);

interface GeocodedFeature {
  geometry: {
    coordinates: [number, number];
  };
}

interface GeocodedFeatureCollection {
  features?: GeocodedFeature[];
}

interface BatchGeocodeResponse {
  batch: GeocodedFeatureCollection[];
}

interface BatchGeocodeRequest {
  types: string[];
  q: string;
  bbox: [number, number, number, number];
  limit: number;
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

    // The map is created once, usually while its container is hidden on mobile
    // (list view is the default). Mapbox GL only re-renders on `window` resize
    // events, so when the LIST/MAP pill later reveals the container the canvas
    // keeps its stale (tiny) size and leaves whitespace behind the carousel.
    // A ResizeObserver re-fits the canvas whenever the container changes size,
    // including the hidden (0x0) -> visible transition.
    let frame = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Skip the 0x0 size we get while the panel is still hidden.
        if (
          mapContainer.current?.clientWidth &&
          mapContainer.current?.clientHeight
        ) {
          newMap.resize();
        }
      });
    });
    resizeObserver.observe(mapContainer.current);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      newMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    const placeMarker = (
      r: Restaurant,
      index: number,
      lngLat: [number, number]
    ) => {
      const [lng, lat] = lngLat;
      const el = document.createElement('button');
      el.className =
        'w-7 h-7 rounded-full text-inverse-on-surface text-xs font-bold border-2 border-inverse-on-surface shadow-md cursor-pointer bg-inverse-surface hover:bg-on-primary-container transition-colors flex items-center justify-center';
      el.textContent = String(index + 1);
      el.addEventListener('click', () => onMarkerClick(r.name));
      new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      markersRef.current[r.name] = { el, lngLat: [lng, lat] };
    };

    const missing = restaurants.filter((r) => !r.coordinates);

    restaurants.forEach((r, index) => {
      if (r.coordinates) placeMarker(r, index, r.coordinates);
    });

    if (missing.length === 0) return;

    const geocodeFallback = async () => {
      const requestBody: BatchGeocodeRequest[] = missing.map((r) => ({
        types: ['address'],
        q: r.address,
        bbox: [-122.6, 47.0, -121.9, 47.9],
        limit: 1
      }));

      try {
        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/batch?access_token=${mapboxgl.accessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          }
        );
        const { batch } = (await response.json()) as BatchGeocodeResponse;
        batch.forEach((fc, i) => {
          if (fc.features && fc.features.length > 0) {
            const r = missing[i];
            const globalIndex = restaurants.indexOf(r);
            const lngLat = fc.features[0].geometry.coordinates;
            placeMarker(r, globalIndex, lngLat);
          }
        });
      } catch (err) {
        console.error('Geocode fallback failed:', err);
      }
    };

    void geocodeFallback();
    // restaurants and onMarkerClick are stable (static data + stable callback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([name, { el }]) => {
      if (name === activeId) {
        el.classList.remove('bg-inverse-surface');
        el.classList.add('bg-primary', 'scale-110');
        el.style.zIndex = '1';
      } else {
        el.classList.remove('bg-primary', 'scale-110');
        el.classList.add('bg-inverse-surface');
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
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="absolute inset-0 lg:inset-4" />
    </div>
  );
}
