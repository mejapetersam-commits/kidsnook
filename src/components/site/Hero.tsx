import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import girl from "@/assets/girl-glasses.png.asset.json";

const trust = [
  "Child-Friendly Environment",
  "Professional Stylists",
  "Safe Play Areas",
  "Fun Learning Spaces",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:py-20">
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-accent-foreground">
            Play · Create · Get Pampered
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-foreground text-balance sm:text-5xl lg:text-6xl">
            More Than a Salon.
            <span className="block text-primary">A Happy Place for Kids.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg font-medium text-muted-foreground">
            Haircare, play, creativity, and memorable experiences—all under one roof.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="hero" size="xl" asChild>
              <a href="#booking">Book Appointment</a>
            </Button>
            <Button variant="sun" size="xl" asChild>
              <a href="#services">Explore Activities</a>
            </Button>
          </div>

          <ul className="mt-9 grid grid-cols-2 gap-3">
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative">
            <div className="absolute -inset-3 -rotate-2 rounded-[2.5rem] bg-gradient-hero opacity-90" />
            <img
              src={girl.url}
              alt="Smiling young girl with braided hair and colorful glasses at Kids' Nook"
              width={1200}
              height={900}
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-card"
            />
            <div className="absolute -bottom-5 left-5 rounded-2xl bg-secondary px-5 py-3 shadow-soft">
              <p className="font-display text-2xl font-extrabold text-secondary-foreground">5,000+</p>
              <p className="text-xs font-bold text-secondary-foreground/80">Happy little visitors</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
