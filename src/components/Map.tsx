import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = String(import.meta.env.VITE_MAPBOX_TOKEN);

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

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
        // TODO: figure out how to do this in bulk
        const params = {
          q: '4523 California Ave SW, Seattle, WA 98116',
          access_token: mapboxgl.accessToken,
          bbox: '-122.5,47,122,48'
        };
        const queryString = new URLSearchParams(
          params as Record<string, string>
        ).toString();
        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/forward?q=${queryString}`
        );

        // TODO: figure out what type this should be
        const data = await response.json();

        if (data.features.length > 0) {
          // TODO: figure out how to find the "correct" Feature
          // console.log(data);
          const [lng, lat] = data.features[1].geometry.coordinates;

          new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    fetchCoordinates();
  }, [map]);

  return (
    <div ref={mapContainer} className="h-full w-full">
      MAP
    </div>
  );
}
