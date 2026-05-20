import { MenuSearch } from "@/components/MenuSearch";
import { menuSections } from "@/lib/menu-data";

export default function MenuPage() {
  return (
    <main className="pb-12">
      <section className="px-4 py-8 sm:px-8 sm:py-10">
        <div className="paper-card p-5 sm:p-7">
          <p className="text-sm font-black uppercase tracking-normal text-[var(--deep-bamboo)]">
            China 1 takeout menu
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-normal text-[var(--china-red)] sm:text-6xl">
            Full Menu
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-stone-800">
            Search by dish, item number, category, or price. Hot & spicy items
            are marked with a chili icon.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <MenuSearch sections={menuSections} />
      </section>
    </main>
  );
}
