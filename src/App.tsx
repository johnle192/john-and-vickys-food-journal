import './App.css';
import RestaurantList from './components/RestaurantList.tsx';
import Map from './components/Map.tsx';

function App() {
  return (
    <div className="flex min-h-full w-screen flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            John and Vicky's Food Journal
          </h3>
        </div>
      </header>

      <div className="mx-auto flex w-full items-start gap-x-8 px-4 py-24 sm:px-6 lg:px-8">
        <RestaurantList />

        <main className="flex-1 h-svh w-3/5 relative">
          <div className="fixed h-full w-full">
            <Map />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
