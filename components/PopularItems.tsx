import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { menuSections } from "@/lib/menu-data";
import type { MenuItem } from "@/lib/menu-data";
import { MenuItemCard } from "@/components/MenuItemCard";

function findMenuItem(
  sectionId: string,
  matcher: (item: MenuItem) => boolean,
) {
  return menuSections.find((section) => section.id === sectionId)?.items.find(matcher);
}

const popularItems = [
  findMenuItem(
    "chefs-specialties",
    (item) => item.name === "General Tso's Chicken",
  ),
  findMenuItem(
    "specialty-platters",
    (item) => item.name === "Fried Chicken Wings (4 whole)",
  ),
  findMenuItem("lo-mein", (item) => item.id === "33"),
].filter((item): item is MenuItem => Boolean(item));

export function PopularItems() {
  return (
    <section className="px-4 sm:px-8">
      <div className="paper-card p-5 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[var(--deep-bamboo)]">
              Popular Items
            </p>
            <h2 className="text-3xl font-black text-stone-950">
              Customer favorites
            </h2>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--deep-bamboo)] px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[var(--dark-forest)]"
            href="/order"
          >
            Order Online
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>

        <div className="grid gap-2.5 md:grid-cols-3">
          {popularItems.map((item) => (
            <MenuItemCard compact featured item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
