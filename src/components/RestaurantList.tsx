import { useEffect } from 'react';
import { Restaurant } from '../common/types.ts';

interface RestaurantListProps {
  restaurants: Restaurant[];
  activeId: string | null;
  onActiveChange: (name: string | null) => void;
  listRefs: React.MutableRefObject<Record<string, HTMLElement>>;
}

export default function RestaurantList({
  restaurants,
  activeId,
  onActiveChange,
  listRefs
}: RestaurantListProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target instanceof HTMLElement) {
          onActiveChange(visible.target.dataset.name ?? null);
        }
      },
      { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    Object.values(listRefs.current).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants]);

  return (
    <div className="resturant-container sticky top-8 mb-4 hidden w-2/5 shrink-0 lg:block">
      <div className="m-4 overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-zinc-100">
          {restaurants.map((item, i) => (
            <li
              key={item.name}
              ref={(el) => {
                if (el) listRefs.current[item.name] = el;
              }}
              data-name={item.name}
              className={`group min-h-[60vh] px-8 py-6 transition-colors duration-200 ${
                activeId === item.name
                  ? 'bg-[var(--md-sys-color-primary-container)]/60'
                  : 'hover:bg-zinc-50'
              }`}
            >
              <div className="mb-1 flex items-baseline gap-3">
                <span className="shrink-0 text-lg font-black tabular-nums text-[var(--md-sys-color-primary)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold leading-6 text-gray-900 transition-colors group-hover:text-[var(--md-sys-color-primary)]">
                    {item.name}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {item.area
                      .map((a) =>
                        a
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                      )
                      .join(', ')}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 hover:text-[var(--md-sys-color-primary)] hover:underline transition-colors"
                  >
                    {item.address}
                  </a>
                </div>
              </div>
              <p className="pt-2 text-sm text-gray-600">{item.notes}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
