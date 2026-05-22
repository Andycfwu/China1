import { Clock, Flame, PartyPopper, Soup } from "lucide-react";

const features = [
  {
    title: "Delicious Food",
    text: "Classic Chinese takeout favorites.",
    icon: Soup,
  },
  {
    title: "Quick Service",
    text: "Call ahead for easy pickup.",
    icon: Clock,
  },
  {
    title: "Party Trays",
    text: "Catering trays for gatherings.",
    icon: PartyPopper,
  },
  {
    title: "Hot & Spicy",
    text: "Look for the red chili badge.",
    icon: Flame,
  },
];

export function FeatureStrip() {
  return (
    <section className="hidden px-4 sm:px-8 md:block">
      <div className="paper-card grid overflow-hidden md:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              className="border-b border-[var(--warm-border)] p-4 text-center last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-5"
              key={feature.title}
            >
              <Icon className="mx-auto text-[var(--deep-bamboo)]" size={38} />
              <h2 className="mt-3 text-base font-black uppercase text-stone-950">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
                {feature.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
