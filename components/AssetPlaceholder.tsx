import type { AssetSlot } from "@/lib/asset-slots";

type AssetPlaceholderProps = {
  asset: AssetSlot;
  className?: string;
  compact?: boolean;
};

export function AssetPlaceholder({
  asset,
  className = "",
  compact = false,
}: AssetPlaceholderProps) {
  return (
    <div
      className={`grid place-items-center rounded-md border border-dashed border-[var(--warm-border)] bg-[rgba(255,248,232,0.78)] p-4 text-center shadow-inner ${className}`}
      role="img"
      aria-label={`${asset.label} placeholder`}
    >
      <div>
        <p className="text-sm font-black uppercase tracking-normal text-[var(--deep-bamboo)]">
          TODO asset
        </p>
        <p
          className={`mt-1 font-bold leading-6 text-stone-800 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          Add {asset.src}
        </p>
      </div>
    </div>
  );
}
