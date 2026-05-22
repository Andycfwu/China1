import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Navigation, ShoppingBag } from "lucide-react";
import { imageAssets } from "@/lib/asset-slots";
import { restaurantInfo } from "@/lib/menu-data";
import { AssetPlaceholder } from "@/components/AssetPlaceholder";

export function Hero() {
  return (
    <section className="forest-section px-1 py-10 sm:px-4 lg:py-16">
      <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-white/90 bg-[rgba(255,248,232,0.94)] px-5 py-7 text-center shadow-2xl shadow-green-950/15 backdrop-blur-sm sm:px-8 lg:py-9">
        <div className="mx-auto mb-5 grid size-36 place-items-center overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-[var(--warm-border)] sm:size-40">
          {imageAssets.pandaLogo.exists ? (
            <Image
              src={imageAssets.pandaLogo.src}
              alt="China 1 panda mascot"
              width={150}
              height={150}
              priority
              className="h-full w-full object-contain p-3"
            />
          ) : (
            <AssetPlaceholder asset={imageAssets.pandaLogo} compact className="h-full w-full rounded-full border-0" />
          )}
        </div>

        <h1 className="mt-2 text-5xl font-black leading-none tracking-normal text-[var(--china-red)] sm:text-7xl">
          CHINA 1
        </h1>
        <p className="mt-2 text-base font-black uppercase tracking-normal text-[var(--deep-bamboo)]">
          Chinese Food Take Out
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-black leading-8 text-stone-950 sm:text-xl">
          Camden neighborhood Chinese takeout for pickup, lunch specials, and
          party trays.
        </p>

        <div className="mx-auto mt-6 grid max-w-2xl gap-3 text-sm font-black text-stone-900 sm:text-base">
          <p className="flex justify-center gap-2 text-balance">
            <MapPin className="mt-0.5 shrink-0 text-[var(--deep-bamboo)]" size={19} />
            <span>{restaurantInfo.address}</span>
          </p>
          <p className="flex justify-center gap-2 text-balance">
            <Clock className="mt-0.5 shrink-0 text-[var(--deep-bamboo)]" size={19} />
            <span>Mon-Thu 11 AM-11 PM | Fri-Sat 11 AM-12 AM | Sun 6 PM-12 AM</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--china-red)] px-6 py-3 text-base font-black text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-[var(--dark-red)]"
            href="/order"
          >
            <ShoppingBag aria-hidden="true" size={19} />
            Order Online
          </Link>
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--deep-bamboo)] px-6 py-3 text-base font-black text-white shadow-lg shadow-green-950/20 transition hover:-translate-y-0.5 hover:bg-[var(--dark-forest)]"
            href={restaurantInfo.directionsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Navigation aria-hidden="true" size={19} />
            Directions
          </a>
        </div>
      </div>
    </section>
  );
}
