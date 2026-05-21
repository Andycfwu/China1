import type { MenuSection } from "@/lib/menu-data";

type MenuCategoryNavProps = {
  sections: MenuSection[];
  title?: string;
  idPrefix?: string;
};

export function MenuCategoryNav({
  sections,
  title = "Categories",
  idPrefix = "",
}: MenuCategoryNavProps) {
  return (
    <nav aria-label={title}>
      <p className="mb-3 text-sm font-black uppercase tracking-normal text-[var(--deep-bamboo)]">
        {title}
      </p>
      <div className="menu-scrollbar flex gap-2 overflow-x-auto pb-2 lg:block lg:max-h-[calc(100vh-9rem)] lg:space-y-2 lg:overflow-y-auto lg:pb-0">
        {sections.map((section) => (
          <a
            className="block whitespace-nowrap rounded-md bg-white px-4 py-3 text-sm font-black text-stone-800 shadow-sm ring-1 ring-[var(--warm-border)] transition hover:bg-[var(--jade-green)] hover:text-[var(--deep-bamboo)] lg:whitespace-normal"
            href={`#${idPrefix}${section.id}`}
            key={section.id}
          >
            {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
