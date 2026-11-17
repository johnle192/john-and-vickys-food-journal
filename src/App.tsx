import './App.css';
import { useState, useRef, useEffect } from 'react';
import RestaurantList from './components/RestaurantList.tsx';
import Map from './components/Map.tsx';
import MobileCarousel from './components/MobileCarousel.tsx';
import { Restaurant } from './common/types.ts';
import restaurantsData from './data/restaurants.json';

const restaurants: Restaurant[] = restaurantsData as Restaurant[];

function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const listRefs = useRef<Record<string, HTMLElement>>({});

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const handleMarkerClick = (name: string) => {
    setActiveId(name);
    listRefs.current[name]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="flex h-dvh w-dvw flex-col">
      <header className="z-50 shrink-0 border-b border-outline-variant bg-surface">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h3 className="text-base font-semibold leading-6 text-on-surface">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            John and Vicky's Food Journal
          </h3>
          <button
            onClick={toggleTheme}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className="rounded-full bg-surface-variant p-2 text-on-surface-variant transition-colors hover:bg-outline-variant hover:text-on-surface"
          >
            <i
              className="fa-duotone fa-light fa-moon-over-sun fa-lg"
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      <main className="relative flex flex-1 overflow-hidden">
        {/* List panel: full-width on mobile (hidden when map is shown), 2/5 on desktop */}
        <div
          className={`${
            showMap ? 'hidden lg:flex' : 'flex'
          } w-full flex-col overflow-y-auto lg:w-2/5`}
        >
          <RestaurantList
            restaurants={restaurants}
            activeId={activeId}
            onActiveChange={setActiveId}
            listRefs={listRefs}
          />
        </div>

        {/* Map panel: full-width on mobile (hidden when list is shown), 3/5 on desktop */}
        <div
          className={`${
            showMap ? 'flex' : 'hidden lg:flex'
          } relative h-full w-full lg:w-3/5`}
        >
          <Map
            restaurants={restaurants}
            activeId={activeId}
            onMarkerClick={handleMarkerClick}
          />
          {/* Carousel overlay — mobile only, sits above the map, below the toggle */}
          <div className="absolute inset-x-0 bottom-20 z-10 lg:hidden">
            <MobileCarousel
              restaurants={restaurants}
              activeId={activeId}
              onActiveChange={setActiveId}
            />
          </div>
        </div>
      </main>

      {/* Mobile LIST / MAP toggle pill */}
      <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center lg:hidden">
        <div className="flex overflow-hidden rounded-full border border-outline-variant bg-surface shadow-xl">
          <button
            onClick={() => setShowMap(false)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
              !showMap
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant'
            }`}
          >
            <i
              className="fa-duotone fa-light fa-list-ul text-xs"
              aria-hidden="true"
            />
            LIST
          </button>
          <button
            onClick={() => setShowMap(true)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
              showMap
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant'
            }`}
          >
            <i
              className="fa-duotone fa-light fa-map text-xs"
              aria-hidden="true"
            />
            MAP
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
