import { FeatureStrip } from "@/components/FeatureStrip";
import { Hero } from "@/components/Hero";
import { MenuCategoryGrid } from "@/components/MenuCategoryGrid";
import { PartyTraySection } from "@/components/PartyTraySection";
import { PopularItems } from "@/components/PopularItems";

export default function HomePage() {
  return (
    <main className="space-y-6 pb-10 sm:space-y-8 sm:pb-12">
      <Hero />
      <FeatureStrip />
      <PopularItems />
      <MenuCategoryGrid />
      <PartyTraySection />
    </main>
  );
}
