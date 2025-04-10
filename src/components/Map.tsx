import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FeatureCollection, Point } from 'geojson';

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
        // TODO: figure out how to get addresses from restaurants.json
        // or set up a CMS?
        const addresses: string[] = [
          '4523 California Ave SW, Seattle, WA 98116',
          '3315 Beacon Ave S, Seattle, WA 98144'
        ];

        const requestBody: BatchRequestBodyFragment[] = addresses.map(
          (address: string): BatchRequestBodyFragment => ({
            types: ['address'],
            q: address,
            bbox: [-122.5, 47, 122, 48],
            limit: 1
          })
        );

        const response: Response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/batch?access_token=${mapboxgl.accessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          }
        );

        const responseBody = (await response.json()) as BatchResponseBody;

        responseBody.batch.forEach(
          (featureCollection: FeatureCollection<Point, Properties>) => {
            if (featureCollection.features.length > 0) {
              const [longitude, latitude] =
                featureCollection.features[0].geometry.coordinates;
              new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
            }
          }
        );
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
