import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Navigation, ShoppingBag } from "lucide-react";
import { imageAssets } from "@/lib/asset-slots";
import { restaurantInfo } from "@/lib/menu-data";
import { AssetPlaceholder } from "@/components/AssetPlaceholder";

export function Hero() {
  return (
    <section className="forest-section px-1 py-6 sm:px-4 sm:py-10 lg:py-16">
      <div className="mx-auto max-w-4xl rounded-[1.5rem] border border-white/90 bg-[rgba(255,248,232,0.94)] px-5 py-5 text-center shadow-2xl shadow-green-950/15 backdrop-blur-sm sm:px-8 sm:py-7 lg:py-9">
        <div className="mx-auto mb-3 grid size-28 place-items-center overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-[var(--warm-border)] sm:mb-5 sm:size-40">
          {imageAssets.pandaLogo.exists ? (
            <Image
              src={imageAssets.pandaLogo.src}
              alt="China 1 panda mascot"
              width={150}
              height={150}
              priority
              className="h-full w-full object-contain p-1.5 sm:p-3"
            />
          ) : (
            <AssetPlaceholder asset={imageAssets.pandaLogo} compact className="h-full w-full rounded-full border-0" />
          )}
        </div>

        <h1 className="mt-1 text-5xl font-black leading-none tracking-normal text-[var(--china-red)] sm:mt-2 sm:text-7xl">
          CHINA 1
        </h1>
        <p className="mt-1.5 text-sm font-black uppercase tracking-normal text-[var(--deep-bamboo)] sm:mt-2 sm:text-base">
          Chinese Food Take Out
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold leading-7 text-stone-950 sm:mt-4 sm:text-xl sm:font-black sm:leading-8">
          Camden neighborhood Chinese takeout for pickup, lunch specials, and
          party trays.
        </p>

        <div className="mx-auto mt-5 grid max-w-2xl gap-3 text-sm font-black text-stone-900 sm:mt-6 sm:text-base">
          <p className="flex justify-center gap-2 text-balance">
            <MapPin className="mt-0.5 shrink-0 text-[var(--deep-bamboo)]" size={19} />
            <span>{restaurantInfo.address}</span>
          </p>
          <div className="flex justify-center gap-2 text-left sm:hidden">
            <Clock className="mt-0.5 shrink-0 text-[var(--deep-bamboo)]" size={19} />
            <div className="grid w-full max-w-[17rem] grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1">
              <span>Mon-Thu</span>
              <span>11 AM-11 PM</span>
              <span>Fri-Sat</span>
              <span>11 AM-12 AM</span>
              <span>Sun</span>
              <span>6 PM-12 AM</span>
            </div>
          </div>
          <p className="hidden justify-center gap-2 text-balance sm:flex">
            <Clock className="mt-0.5 shrink-0 text-[var(--deep-bamboo)]" size={19} />
            <span>Mon-Thu 11 AM-11 PM | Fri-Sat 11 AM-12 AM | Sun 6 PM-12 AM</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
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
