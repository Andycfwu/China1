"use client";

import { useMemo, useState } from "react";
import { Flame, Search } from "lucide-react";
import type { MenuSection as MenuSectionType } from "@/lib/menu-data";
import { MenuCategoryNav } from "@/components/MenuCategoryNav";
import { MenuSection } from "@/components/MenuSection";

type MenuSearchProps = {
  sections: MenuSectionType[];
};

export function MenuSearch({ sections }: MenuSearchProps) {
  const [query, setQuery] = useState("");
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sections
      .filter((section) =>
        selectedCategory === "all" ? true : section.id === selectedCategory,
      )
      .map((section) => {
        const sectionMatches = section.title.toLowerCase().includes(normalizedQuery);
        const items = section.items.filter((item) => {
          const text = `${item.displayId ?? item.id} ${item.name} ${item.price} ${
            item.description ?? ""
          }`.toLowerCase();
          const matchesQuery = !normalizedQuery || sectionMatches || text.includes(normalizedQuery);
          const matchesSpicy = !spicyOnly || item.spicy;
          return matchesQuery && matchesSpicy;
        });

        if (!normalizedQuery && !spicyOnly) {
          return section;
        }

        if (items.length === 0) {
          return null;
        }

        return { ...section, items };
      })
      .filter((section): section is MenuSectionType => Boolean(section));
  }, [query, sections, selectedCategory, spicyOnly]);

  return (
    <div className="grid gap-5 lg:grid-cols-[15rem_1fr] lg:items-start">
      <aside className="sticky top-28 z-20 hidden rounded-2xl border border-[var(--warm-border)] bg-[var(--cream-paper)] p-3 shadow-lg shadow-green-950/5 lg:block">
        <MenuCategoryNav sections={sections} />
      </aside>

      <div>
        <div className="sticky top-[5.75rem] z-30 mb-5 rounded-2xl border border-[var(--warm-border)] bg-[var(--cream-paper)] p-3 shadow-lg shadow-green-950/5 lg:top-28">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Search menu</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
                size={22}
              />
              <input
                className="min-h-14 w-full rounded-md border border-[var(--warm-border)] bg-white py-3 pl-12 pr-4 text-base font-semibold text-stone-950 outline-none transition placeholder:text-stone-500 focus:border-[var(--deep-bamboo)] focus:ring-4 focus:ring-green-100"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search dishes, item numbers, or prices"
                type="search"
                value={query}
              />
            </label>

            <button
              className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-black transition ${
                spicyOnly
                  ? "bg-[var(--china-red)] text-white"
                  : "bg-white text-[var(--china-red)] ring-1 ring-red-200"
              }`}
              onClick={() => setSpicyOnly((value) => !value)}
              type="button"
            >
              <Flame aria-hidden="true" size={20} fill="currentColor" />
              Hot & Spicy
            </button>
          </div>
          <label className="mt-3 block lg:hidden">
            <span className="text-sm font-black text-[var(--deep-bamboo)]">
              Category
            </span>
            <select
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--warm-border)] bg-white px-4 py-3 text-base font-black text-stone-950 outline-none focus:border-[var(--deep-bamboo)]"
              onChange={(event) => setSelectedCategory(event.target.value)}
              value={selectedCategory}
            >
              <option value="all">All categories</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-sm font-semibold text-stone-600">
            Prices subject to change. Please call restaurant to confirm current
            pricing.
          </p>
        </div>

        {filteredSections.length > 0 ? (
          <div className="grid gap-5">
            {selectedCategory !== "all" ? (
              <button
                className="rounded-xl border border-[var(--warm-border)] bg-white px-4 py-3 text-left text-sm font-black text-[var(--deep-bamboo)] shadow-sm lg:hidden"
                onClick={() => setSelectedCategory("all")}
                type="button"
              >
                Back to all categories
              </button>
            ) : null}
            {filteredSections.map((section) => (
              <MenuSection section={section} key={section.id} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--warm-border)] bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black text-stone-950">No matches found</h2>
            <p className="mt-2 text-base font-semibold text-stone-700">
              Try another search or turn off the hot & spicy filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
