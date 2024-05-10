import './App.css';
import RestaurantList from './components/RestaurantList.tsx';

function App() {
  return (
    <div className="flex min-h-full w-screen flex-col">
      <header className="shrink-0 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            John and Vicky's Food Journal
          </h3>
        </div>
      </header>

      <div className="mx-auto flex w-full items-start gap-x-8 px-4 py-10 sm:px-6 lg:px-8">
        <RestaurantList />

        <main className="flex-1">{/* Main area */}</main>
      </div>
    </div>
  );
}

export default App;
