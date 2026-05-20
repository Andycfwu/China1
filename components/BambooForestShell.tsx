import type { ReactNode } from "react";

type BambooForestShellProps = {
  children: ReactNode;
};

export function BambooForestShell({ children }: BambooForestShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b341e] text-[var(--text-black)]">
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-[url('/images/bamboo-forest-full.png')] bg-cover bg-center bg-no-repeat"
      />

      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,248,232,0.58)_0%,rgba(255,248,232,0.34)_36%,rgba(11,52,30,0.36)_72%,rgba(3,22,12,0.72)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[45vh] bg-[linear-gradient(to_bottom,rgba(255,248,216,0.5),transparent)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
