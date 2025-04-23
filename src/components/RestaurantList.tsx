import { Restaurant } from '../common/types.ts';
import Map from './Map.tsx';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export default function RestaurantList(
  props: React.PropsWithChildren<RestaurantListProps>
) {
  const restaurants: Restaurant[] = props.restaurants;

  return (
    <div className="overflow-hidden bg-white shadow m-5 sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {restaurants.map((item) => (
          <li key={item.id} className="px-4 py-4 sm:px-6">
            <div className="border-b border-gray-200 max-w-lg mx-auto bg-white py-4">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {item.name}
              </h3>
            </div>
            <div className="max-w-lg mx-auto">
              <p className="pt-2 pb-6 text-sm text-gray-600">{item.notes}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
