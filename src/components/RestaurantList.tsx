import { Restaurant } from '../common/types.ts';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export default function RestaurantList(
  props: React.PropsWithChildren<RestaurantListProps>
) {
  const restaurants: Restaurant[] = props.restaurants;

  return (
    <div className="m-4 overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {restaurants.map((item) => (
          <li key={item.name} className="px-8 py-4 sm:px-10">
            <div className="border-b border-gray-200 bg-white py-4">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {item.name}
              </h3>
            </div>
            <div className="">
              <p className="pb-6 pt-2 text-sm text-gray-600">{item.notes}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
