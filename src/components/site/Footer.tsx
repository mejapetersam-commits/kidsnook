import { MapPin, Clock, Instagram, Phone } from "lucide-react";
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "@/lib/site-data";
import logo from "@/assets/logo.jpeg";

export function Footer() {
  return (
    <footer id="visit" className="bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="KIDS' NOOK logo"
              className="h-14 w-14 rounded-2xl object-cover"
            />
            <span className="font-display text-2xl font-extrabold text-background">
              {"KIDS\u2019 Nook"}
            </span>
          </div>
          <p className="mt-4 max-w-xs font-medium text-background/70">
            Play. Create. Get Pampered. A premium children's salon and activity center in Nairobi.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full bg-background/10 transition-colors hover:bg-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-10 w-10 place-items-center rounded-full bg-background/10 transition-colors hover:bg-primary"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-extrabold text-background">Visit Us</h3>
          <ul className="mt-4 space-y-3 text-background/80">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium">
                Nairobi, Ngong Road, opposite Ngong Hills Hotel.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium">Open Tue – Sun, 9:00 am – 6:00 pm</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-extrabold text-background">Explore</h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-background/80">
            {[
              ["About", "#about"],
              ["Services", "#services"],
              ["Loyalty", "#loyalty"],
              ["Gallery", "#gallery"],
              ["Reviews", "#testimonials"],
              ["Book Now", "#booking"],
            ].map(([l, h]) => (
              <li key={h}>
                <a href={h} className="font-medium transition-colors hover:text-primary">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10 py-5 text-center text-sm text-background/60">
        © {new Date().getFullYear()} {"KIDS\u2019 Nook"} · Play. Create. Get Pampered.
      </div>
    </footer>
  );
}
