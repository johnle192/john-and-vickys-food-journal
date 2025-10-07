import './App.css';
import RestaurantList from './components/RestaurantList.tsx';
import Map from './components/Map.tsx';
import { useEffect, useState } from 'react';
import { Restaurant } from './common/types.ts';

const foodJournalCmsUrl = String(
  import.meta.env.VITE_FOOD_JOURNAL_CMS_BASE_URL
);

interface RestaurantsResponseBody {
  docs: Restaurant[];
}

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response: Response = await fetch(
          `${foodJournalCmsUrl}/api/restaurants`
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="mx-auto flex w-full items-start mt-20">
        <header className="shrink-0 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              John and Vicky's Food Journal
            </h3>
          </div>
        </header>
        <main className="flex h-full">
          <div className="resturant-container sticky top-8 hidden w-2/5 shrink-0 lg:block">
            <RestaurantList restaurants={restaurants} />
          </div>

          <div className="map-container sticky top-20 h-[calc(100vh-8rem)] w-3/5 left-auto right-0 z-10">
            <div className="h-full m-5 overflow-hidden">
              <Map restaurants={restaurants} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
