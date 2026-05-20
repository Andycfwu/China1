import Link from "next/link";
import { Phone } from "lucide-react";
import { restaurantInfo } from "@/lib/menu-data";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/party-trays", label: "Party Trays" },
  { href: "/#hours", label: "Hours" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--warm-border)] bg-[rgba(255,248,232,0.88)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link className="group flex min-w-0 items-center gap-3" href="/">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--china-red)] text-xl font-black text-white shadow-md ring-4 ring-white/80">
            1
          </span>
          <span className="min-w-0">
            <span className="block text-2xl font-black leading-none tracking-normal text-[var(--china-red)] transition group-hover:text-[var(--dark-red)]">
              CHINA 1
            </span>
            <span className="block text-xs font-black text-stone-800">
              Chinese Food Take Out
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              className="text-sm font-black text-stone-950 transition hover:text-[var(--china-red)]"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--dark-forest)] px-4 py-2 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--deep-bamboo)]"
          href={`tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`}
        >
          <Phone aria-hidden="true" size={17} />
          <span className="hidden sm:inline">{restaurantInfo.primaryPhone}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>

      <nav
        className="menu-scrollbar flex gap-6 overflow-x-auto border-t border-[var(--warm-border)] px-4 py-2 sm:px-8 lg:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <Link
            className="whitespace-nowrap border-b-2 border-transparent py-1 text-sm font-black text-stone-950 hover:border-[var(--china-red)] hover:text-[var(--china-red)]"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
