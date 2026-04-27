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
    <div className="resturant-container mb-4 w-full lg:sticky lg:top-8 lg:w-2/5 lg:shrink-0">
      <div className="m-4 overflow-hidden bg-surface">
        <ul role="list" className="divide-y divide-outline-variant">
          {restaurants.map((item, i) => (
            <li
              key={item.name}
              ref={(el) => {
                if (el) listRefs.current[item.name] = el;
              }}
              data-name={item.name}
              className={`group min-h-[60vh] px-8 py-6 transition-colors duration-200 ${
                activeId === item.name
                  ? 'bg-primary-container'
                  : 'hover:bg-surface-variant'
              }`}
            >
              <div className="mb-1 flex items-baseline gap-3">
                <span className="shrink-0 text-lg font-black tabular-nums text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold leading-6 text-on-surface transition-colors group-hover:text-primary">
                    {item.name}
                  </h3>
                  {item.area?.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <i className="fa-duotone fa-light fa-city"></i>
                      <span className="text-sm text-on-surface-variant">
                        {item.area
                          .map((a) =>
                            a
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                          )
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <i className="fa-duotone fa-light fa-map-location-dot"></i>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        item.name + ' ' + item.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline"
                    >
                      {item.address}
                    </a>
                  </div>
                </div>
              </div>
              <p className="pt-2 text-sm text-on-surface-variant">
                {item.notes}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
