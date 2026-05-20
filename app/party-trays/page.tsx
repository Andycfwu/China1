import { PartyTraySection } from "@/components/PartyTraySection";

export default function PartyTraysPage() {
  return (
    <main className="pb-12">
      <section className="px-4 py-8 sm:px-8 sm:py-10">
        <div className="paper-card p-5 sm:p-7">
          <p className="text-sm font-black uppercase tracking-normal text-[var(--china-red)]">
            For all occasions
          </p>
          <h1 className="mt-2 text-5xl font-black tracking-normal text-[var(--deep-bamboo)] sm:text-6xl">
            Party Trays
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-stone-800">
            Clean catering pricing for pickup orders, with hot & spicy dishes
            clearly marked.
          </p>
        </div>
      </section>
      <PartyTraySection />
    </main>
  );
}
