import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Hero } from "@/components/Hero";
import { MenuCategoryGrid } from "@/components/MenuCategoryGrid";
import { PartyTraySection } from "@/components/PartyTraySection";
import { PopularItems } from "@/components/PopularItems";
import { restaurantInfo } from "@/lib/menu-data";

export default function HomePage() {
  return (
    <main className="space-y-6 pb-10 sm:space-y-8 sm:pb-12">
      <Hero />
      <FeatureStrip />
      <PopularItems />
      <MenuCategoryGrid />

      <section className="px-4 sm:px-8">
        <div className="paper-card grid gap-5 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[var(--china-red)]">
              Call-ahead pickup
            </p>
            <h2 className="mt-2 text-3xl font-black text-[var(--deep-bamboo)]">
              Ready to order?
            </h2>
            <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-stone-700">
              Call the restaurant directly for fast takeout pickup.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--china-red)] px-5 py-3 text-base font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--dark-red)]"
              href={`tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`}
            >
              <Phone size={18} />
              Call to Order
            </a>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--deep-bamboo)] px-5 py-3 text-base font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--dark-forest)]"
              href="/party-trays"
            >
              Party Trays
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <PartyTraySection />
    </main>
  );
}
