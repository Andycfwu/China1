import { Clock, MapPin, Phone } from "lucide-react";
import { restaurantInfo } from "@/lib/menu-data";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="relative left-1/2 right-1/2 -mx-[50vw] mt-24 w-screen text-[#fff8e8]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(11,52,30,0.45)_28%,rgba(3,22,12,0.94)_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-48 sm:px-6 lg:px-8">
        <div className="w-full border-t border-white/15 pt-8">
          <div className="grid gap-8 md:grid-cols-[1fr_1fr_1fr]">
            <div>
              <p className="text-4xl font-black tracking-normal text-[var(--china-red)]">
                CHINA 1
              </p>
              <p className="mt-1 font-black text-white">
                Chinese Food Take Out
              </p>
              <p className="mt-6 text-sm font-semibold text-white/75">
                Prices subject to change.
              </p>
            </div>

            <div
              id="hours"
              className="space-y-4 text-sm font-semibold leading-6 text-white/90"
            >
              <p className="flex gap-3">
                <MapPin
                  className="mt-1 shrink-0 text-[var(--jade-green)]"
                  size={17}
                />
                <span>{restaurantInfo.address}</span>
              </p>

              <div className="flex gap-3">
                <Clock
                  className="mt-1 shrink-0 text-[var(--jade-green)]"
                  size={17}
                />
                <div>
                  {restaurantInfo.hours.map((row) => (
                    <p key={row.days}>
                      <span className="font-black">{row.days}:</span>{" "}
                      {row.time}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm font-semibold leading-6 text-white/90">
              <p className="mb-2 flex items-center gap-2 font-black text-white">
                <Phone size={17} />
                Phone
              </p>

              <a
                className="block hover:text-[var(--jade-green)]"
                href={`tel:${restaurantInfo.primaryPhone.replaceAll("-", "")}`}
              >
                <span className="font-black">Main Phone:</span>{" "}
                {restaurantInfo.primaryPhone}
              </a>

              {restaurantInfo.otherPhones.map((phone, index) => (
                <a
                  className="block hover:text-[var(--jade-green)]"
                  href={`tel:${phone.replaceAll("-", "")}`}
                  key={phone}
                >
                  <span className="font-black">
                    {index === 0 ? "Secondary Phone" : `Phone ${index + 2}`}:
                  </span>{" "}
                  {phone}
                </a>
              ))}

              <p className="mt-6 text-xs font-black uppercase tracking-normal text-red-200">
                Red chili badge = Hot & Spicy
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
