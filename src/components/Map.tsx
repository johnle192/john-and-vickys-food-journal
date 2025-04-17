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
}

export default function Map(props: React.PropsWithChildren<MapProps>) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const restaurants: Restaurant[] = props.restaurants;

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
    if (!map || !restaurants) return;

    const fetchCoordinates = async () => {
      try {
        const addresses: string[] = restaurants.map(
          (restaurant: Restaurant): string => restaurant.address
        );

        const requestBody: BatchRequestBodyFragment[] = addresses.map(
          (address: string): BatchRequestBodyFragment => ({
            types: ['address'],
            q: address,
            bbox: [-122.5, 47, -122, 48],
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
          (
            featureCollection: FeatureCollection<Point, Properties>,
            index: number
          ) => {
            if (
              featureCollection &&
              Array.isArray(featureCollection.features) &&
              featureCollection.features.length > 0
            ) {
              const [longitude, latitude] =
                featureCollection.features[0].geometry.coordinates;
              new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);
            } else {
              console.warn(
                `No features for address at index ${index}`,
                featureCollection
              );
            }
          }
        );
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    fetchCoordinates().catch((error) =>
      console.error('Error in fetchCoordinates:', error)
    );
  }, [map, restaurants]);

  return (
    <div ref={mapContainer} className="h-full w-full">
      MAP
    </div>
  );
}
