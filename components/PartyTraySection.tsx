import Link from "next/link";
import { ArrowRight, Gamepad2, Phone, PartyPopper, Users } from "lucide-react";
import { restaurantInfo } from "@/lib/menu-data";

const groupOptions = [
  {
    cta: "View Specials",
    href: "/order#family-specials",
    icon: Users,
    subtitle: "Feeds 3-6 people",
    title: "Family Specials",
  },
  {
    cta: "View Combo",
    href: "/order#family-specials",
    icon: Gamepad2,
    subtitle: "Wings, fries, ribs, donuts & more",
    title: "Game Day Combo",
  },
  {
    cta: "Call to Confirm",
    href: `tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`,
    icon: Phone,
    subtitle: "Catering available by request",
    title: "Party Trays",
  },
];

export function PartyTraySection() {
  return (
    <section className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="paper-card p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-black uppercase tracking-normal text-[var(--china-red)]">
              <PartyPopper aria-hidden="true" size={17} />
              CATERING AVAILABLE
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-normal text-[var(--deep-bamboo)] sm:text-4xl">
              Party Trays, Family Specials & Game Day Combos
            </h2>
            <p className="mt-2 max-w-3xl text-lg font-semibold leading-8 text-stone-700">
              Easy group-order options for family meals, office lunches,
              parties, and game days. Order online or call ahead for larger
              catering trays.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--warm-border)] bg-white p-4 shadow-sm">
            <h3 className="text-xl font-black text-stone-950">
              Group Ordering Options
            </h3>
            <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-stone-700">
              <li>Family Specials A-E</li>
              <li>Game Day Combo F</li>
              <li>Catering trays available by phone</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {groupOptions.map((option, index) => {
            const Icon = option.icon;
            const isPhone = option.href.startsWith("tel:");
            const className = `group rounded-xl border border-[var(--warm-border)] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--deep-bamboo)] hover:shadow-md ${
              index === 2 ? "md:col-span-2" : ""
            }`;

            const content = (
              <>
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--jade-green)] text-[var(--deep-bamboo)]">
                    <Icon aria-hidden="true" size={22} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-black leading-6 text-stone-950">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-stone-600">
                      {option.subtitle}
                    </span>
                  </span>
                </div>
                <span className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--deep-bamboo)] px-4 py-2 text-sm font-black text-white transition group-hover:bg-[var(--dark-forest)]">
                  {option.cta}
                  {isPhone ? (
                    <Phone aria-hidden="true" size={16} />
                  ) : (
                    <ArrowRight aria-hidden="true" size={16} />
                  )}
                </span>
              </>
            );

            return isPhone ? (
              <a className={className} href={option.href} key={option.title}>
                {content}
              </a>
            ) : (
              <Link className={className} href={option.href} key={option.title}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
