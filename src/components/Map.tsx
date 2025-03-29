import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mapboxgl.accessToken = String(import.meta.env.VITE_MAPBOX_TOKEN);

    if (mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.350616, 47.6206],
        zoom: 10
      });

      map.on('wheel', (event) => {
        if (
          event.originalEvent.ctrlKey ||
          event.originalEvent.metaKey ||
          event.originalEvent.altKey
        ) {
          return;
        }

        event.preventDefault();
      });
      map.addControl(new mapboxgl.NavigationControl(), 'top-left');
      return () => map.remove();
    }
  }, []);
  return (
    <div ref={mapContainer} className="h-full w-full">
      MAP
    </div>
  );
}
