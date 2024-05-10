const items = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
  { id: 11 },
  { id: 12 }
];

export default function RestaurantList() {
  return (
    <aside className="sticky top-8 hidden w-2/5 shrink-0 lg:block">
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-6">
              <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Restaurant Name
                </h3>
              </div>
              <div>
                <p className="mt-1 text-sm text-gray-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
                  tristique bibendum nisl, a aliquam justo eleifend vitae. Ut ac
                  pellentesque odio. Etiam a dui id leo rhoncus facilisis
                  maximus at nisi. Nam eget tellus quis nunc rutrum varius. Nunc
                  ante ex, imperdiet vel tortor ac, maximus volutpat nunc.
                  Aliquam nec quam porta, sagittis odio id, interdum mauris.
                  Proin in dapibus neque. Donec sit amet tellus volutpat,
                  commodo turpis a, lobortis nisi. Phasellus orci ipsum, gravida
                  at consequat mattis, faucibus cursus velit. Maecenas sed
                  tristique ligula, sit amet faucibus risus.
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
