import type { MenuSection as MenuSectionType } from "@/lib/menu-data";
import { MenuItemCard } from "@/components/MenuItemCard";

type MenuSectionProps = {
  section: MenuSectionType;
  partyStyle?: boolean;
};

export function MenuSection({ section, partyStyle = false }: MenuSectionProps) {
  return (
    <section
      className={`scroll-mt-36 rounded-2xl border p-4 shadow-lg shadow-green-950/5 sm:p-5 ${
        partyStyle
          ? "border-red-200 bg-[var(--cream-paper)]"
          : "border-[var(--warm-border)] bg-[var(--cream-paper)]"
      }`}
      id={section.id}
    >
      <div className="mb-4 border-b border-[var(--warm-border)] pb-3">
        <h2 className="text-2xl font-black tracking-normal text-[var(--deep-bamboo)] sm:text-3xl">
          {section.title}
        </h2>
        {section.note ? (
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-700 sm:text-base">
            {section.note}
          </p>
        ) : null}
      </div>

      {section.items.length > 0 ? (
        <div className="grid gap-2.5 lg:grid-cols-2">
          {section.items.map((item) => (
            <MenuItemCard compact featured={partyStyle} item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-green-900/20 bg-white p-4 text-base font-semibold text-stone-700">
          Items for this section are being updated.
        </div>
      )}
    </section>
  );
}
