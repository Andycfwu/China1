import { Flame, Phone, PartyPopper, Users } from "lucide-react";
import { partyTraySections } from "@/lib/menu-data";
import { restaurantInfo } from "@/lib/menu-data";
import { MenuSection } from "@/components/MenuSection";

export function PartyTraySection() {
  return (
    <section className="px-4 py-8 sm:px-8 sm:py-10">
      <div className="paper-card p-5 sm:p-6">
        <div className="mb-6 grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-black uppercase tracking-normal text-[var(--china-red)]">
              <PartyPopper aria-hidden="true" size={17} />
              Catering Available
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-normal text-[var(--deep-bamboo)]">
              Party Trays / Catering Available
            </h2>
            <p className="mt-2 max-w-3xl text-lg font-semibold leading-8 text-stone-700">
              Clean tray pricing for gatherings, offices, and family events.
              Call ahead to confirm current pricing and pickup timing.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-[var(--warm-border)] bg-white p-4">
              <Users className="mx-auto text-[var(--deep-bamboo)]" />
              <p className="mt-2 text-sm font-black">Group Orders</p>
            </div>
            <div className="rounded-xl border border-[var(--warm-border)] bg-white p-4">
              <Flame className="mx-auto text-[var(--china-red)]" fill="currentColor" />
              <p className="mt-2 text-sm font-black">Spicy Options</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {partyTraySections.map((section) => (
            <MenuSection partyStyle section={section} key={section.id} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--china-red)] px-5 py-3 text-base font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--dark-red)]"
            href={`tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`}
          >
            <Phone size={18} />
            Call for Catering
          </a>
        </div>
      </div>
    </section>
  );
}
