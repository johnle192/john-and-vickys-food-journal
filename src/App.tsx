import './App.css';
import RestaurantList from './components/RestaurantList.tsx';
import Map from './components/Map.tsx';

function App() {
  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="mx-auto flex w-full items-start py-24 ">
        <header className="shrink-0 border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              John and Vicky's Food Journal
            </h3>
          </div>
        </header>

        <main className="flex">
          <div className="resturant-container sticky top-8 hidden w-2/5 shrink-0 lg:block">
            <RestaurantList />
          </div>

          <div className="map-container h-full w-3/5 left-auto right-0 z-10 fixed">
            {/* TODO: This might need a calculation like on eater calc(100% - 150px - 95px - 20px - 10px)*/}
            <div className="relative overflow-hidden h-5/6 m-5">
              <Map />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
