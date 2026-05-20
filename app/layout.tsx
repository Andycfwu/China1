import type { Metadata } from "next";
import "./globals.css";
import { BambooForestShell } from "@/components/BambooForestShell";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "China 1 | Chinese Food Take Out Restaurant in Camden, NJ",
  description:
    "China 1 Chinese Food Take Out Restaurant at 450 S Broadway, Camden, NJ. Call to order, view menu categories, hours, and party tray catering information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <BambooForestShell>
          <SiteHeader />
          {children}
          <SiteFooter />
        </BambooForestShell>
      </body>
    </html>
  );
}
