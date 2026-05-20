import Link from "next/link";
import {
  Beef,
  Carrot,
  Drumstick,
  Egg,
  Flame,
  Leaf,
  PartyPopper,
  Soup,
  Utensils,
  Wheat,
} from "lucide-react";
import { menuSections } from "@/lib/menu-data";

const iconMap: Record<string, typeof Soup> = {
  "lunch-special": Utensils,
  "chefs-specialties": Flame,
  "combination-platters": Soup,
  appetizers: Wheat,
  soup: Soup,
  "lo-mein": Utensils,
  "chow-mei-fun": Utensils,
  "fried-rice": Soup,
  beef: Beef,
  chicken: Drumstick,
  pork: Beef,
  seafood: Soup,
  vegetable: Carrot,
  "egg-foo-young": Egg,
  "diet-menu": Leaf,
  "sweet-sour": Soup,
  "wing-special": Drumstick,
};

export function MenuCategoryGrid() {
  return (
    <section className="px-4 sm:px-8">
      <div className="paper-card p-5 sm:p-6">
        <div className="mb-5 text-center">
          <p className="text-sm font-black uppercase text-[var(--deep-bamboo)]">
            Menu Categories
          </p>
          <h2 className="text-3xl font-black text-stone-950">
            Browse the takeout menu
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {menuSections.slice(0, 15).map((section) => {
            const Icon = iconMap[section.id] ?? PartyPopper;
            return (
              <Link
                className="group rounded-md border border-[var(--warm-border)] bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--deep-bamboo)] hover:shadow-md sm:p-4"
                href={`/menu#${section.id}`}
                key={section.id}
              >
                <Icon className="mx-auto text-[var(--deep-bamboo)] transition group-hover:text-[var(--china-red)]" size={28} />
                <span className="mt-2 block text-sm font-black leading-5 text-stone-950">
                  {section.title}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--china-red)] px-5 py-2 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--dark-red)]"
            href="/menu"
          >
            Browse All Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
