import './App.css';
import { useState, useRef } from 'react';
import RestaurantList from './components/RestaurantList.tsx';
import Map from './components/Map.tsx';
import { Restaurant } from './common/types.ts';
import restaurantsData from './data/restaurants.json';

const restaurants: Restaurant[] = restaurantsData as Restaurant[];

function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLElement>>({});

  const handleMarkerClick = (name: string) => {
    setActiveId(name);
    listRefs.current[name]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="mx-auto mt-20 flex w-full items-start">
        <header className="fixed left-0 right-0 top-0 z-50 shrink-0 border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              John and Vicky's Food Journal
            </h3>
          </div>
        </header>
        <main className="mx-4 flex h-full">
          <RestaurantList
            restaurants={restaurants}
            activeId={activeId}
            onActiveChange={setActiveId}
            listRefs={listRefs}
          />
          <Map
            restaurants={restaurants}
            activeId={activeId}
            onMarkerClick={handleMarkerClick}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
