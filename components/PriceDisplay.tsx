type PriceDisplayProps = {
  price: string;
  align?: "left" | "right";
};

export function PriceDisplay({ price, align = "left" }: PriceDisplayProps) {
  const tiers = price
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (tiers.length > 1) {
    return (
      <div
        className={`flex flex-wrap gap-2 ${
          align === "right" ? "md:justify-end" : ""
        }`}
      >
        {tiers.map((tier) => (
          <span
            className="rounded-full bg-red-50 px-2 py-1 text-xs font-black leading-snug text-[var(--china-red)]"
            key={tier}
          >
            {tier}
          </span>
        ))}
      </div>
    );
  }

  return (
    <p
      className={`whitespace-normal text-sm font-black leading-snug text-[var(--china-red)] sm:text-base ${
        align === "right" ? "md:text-right" : ""
      }`}
    >
      {price}
    </p>
  );
}
