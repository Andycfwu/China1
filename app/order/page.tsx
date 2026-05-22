import { OrderMenu } from "@/components/OrderMenu";
import { orderableMenuSections } from "@/lib/menu-data";

export default function OrderPage() {
  return (
    <main className="pointer-events-auto relative z-10 max-w-full space-y-6 overflow-x-hidden pb-32 pt-8 sm:pt-10 lg:pb-0">
      <section className="paper-card p-5 sm:p-6">
        <p className="text-sm font-black uppercase text-[var(--china-red)]">
          Pickup ordering MVP
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-normal text-[var(--deep-bamboo)] sm:text-5xl">
          Order Online
        </h1>
        <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-stone-800">
          Add items to your cart, leave notes, and submit a pickup order. Payment
          is cash or Cash App at pickup. No card payment or delivery yet.
        </p>
      </section>

      <OrderMenu sections={orderableMenuSections} />
    </main>
  );
}
