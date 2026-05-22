"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import { restaurantInfo } from "@/lib/menu-data";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order Online" },
  { href: "/party-trays", label: "Party Trays" },
  { href: "/#hours", label: "Hours" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="hidden min-h-11 items-center justify-center rounded-md bg-[var(--china-red)] px-4 py-2 text-sm font-black text-white shadow-md md:inline-flex lg:hidden"
            href="/order"
          >
            Order Online
          </Link>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--dark-forest)] px-3 py-2 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--deep-bamboo)] sm:px-4"
            href={`tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`}
          >
            <Phone aria-hidden="true" size={17} />
            <span className="hidden sm:inline">{restaurantInfo.primaryPhone}</span>
            <span className="sm:hidden">Call</span>
          </a>
          <button
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="grid min-h-11 min-w-11 place-items-center rounded-md border border-[var(--warm-border)] bg-white text-[var(--deep-bamboo)] lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          className="border-t border-[var(--warm-border)] bg-[rgba(255,248,232,0.96)] px-4 py-3 shadow-lg lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                className="min-h-11 rounded-md px-3 py-3 text-base font-black text-stone-950 hover:bg-white hover:text-[var(--china-red)]"
                href={item.href}
                key={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
