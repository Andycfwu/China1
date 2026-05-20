import { Flame } from "lucide-react";
import type { MenuItem } from "@/lib/menu-data";

type MenuItemCardProps = {
  item: MenuItem;
  featured?: boolean;
  compact?: boolean;
};

export function MenuItemCard({
  item,
  featured = false,
  compact = false,
}: MenuItemCardProps) {
  return (
    <article
      className={`rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "p-3.5" : "p-4 sm:p-5"
      } ${
        featured ? "border-red-200" : "border-green-900/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[var(--jade-green)] px-2 py-1 text-xs font-black text-[var(--deep-bamboo)]">
              {item.id}
            </span>
            {item.spicy ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-black text-[var(--china-red)]">
                <Flame aria-hidden="true" size={15} fill="currentColor" />
                Hot & Spicy
              </span>
            ) : null}
          </div>
          <h3 className={`${compact ? "text-base sm:text-lg" : "text-xl"} mt-2.5 font-black leading-7 text-stone-950`}>
            {item.name}
          </h3>
        </div>
        <p className="shrink-0 text-right text-base font-black text-[var(--china-red)] sm:text-lg">
          {item.price}
        </p>
      </div>
      {item.description ? (
        <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
          {item.description}
        </p>
      ) : null}
    </article>
  );
}
