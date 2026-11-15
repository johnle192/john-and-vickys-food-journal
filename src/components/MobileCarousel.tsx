import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useCallback } from 'react';
import { Restaurant } from '../common/types.ts';

interface Props {
  restaurants: Restaurant[];
  activeId: string | null;
  onActiveChange: (name: string) => void;
}

export default function MobileCarousel({
  restaurants,
  activeId,
  onActiveChange
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start'
  });

  // Scroll to active card when activeId changes externally (marker click)
  useEffect(() => {
    if (!emblaApi || !activeId) return;
    const idx = restaurants.findIndex((r) => r.name === activeId);
    if (idx !== -1 && emblaApi.selectedScrollSnap() !== idx) {
      emblaApi.scrollTo(idx);
    }
  }, [activeId, emblaApi, restaurants]);

  // Update activeId when user swipes to a new card
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const r = restaurants[emblaApi.selectedScrollSnap()];
    if (r && r.name !== activeId) onActiveChange(r.name);
  }, [emblaApi, restaurants, activeId, onActiveChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className="flex">
        {restaurants.map((r, i) => (
          <div key={r.name} className="min-w-0 flex-[0_0_100%] px-3">
            <div className="rounded-2xl bg-surface p-4 shadow-lg">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="shrink-0 font-black tabular-nums text-primary">
                  {i + 1}
                </span>
                <h3 className="text-base font-bold leading-tight text-on-surface">
                  {r.name}
                </h3>
              </div>
              {r.area?.length > 0 && (
                <p className="mb-1 text-xs text-on-surface-variant">
                  {r.area
                    .map((a) =>
                      a
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    )
                    .join(', ')}
                </p>
              )}
              <p className="text-xs text-on-surface-variant">{r.address}</p>
              {r.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-on-surface">
                  {r.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
