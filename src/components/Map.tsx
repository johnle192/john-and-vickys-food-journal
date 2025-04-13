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

interface Restaurants {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  city: string;
  area: string[];
  address: string;
  cuisine: string;
  notes: string;
  dined: boolean;
}

interface RestaurantsResponseBody {
  docs: Restaurants[];
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

  // TODO: this probably goes in app and gets passed into the other two components
  const [restaurants, setRestaurants] = useState<Restaurants[] | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response: Response = await fetch(
          `http://localhost:3000/api/restaurants`
        );

        const responseBody = (await response.json()) as RestaurantsResponseBody;

        setRestaurants(responseBody.docs);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants().catch((error) => {
      console.error('Error in fetchRestaurants:', error);
    });
  }, []);

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
          (restaurants: Restaurants): string => restaurants.address
        );

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
