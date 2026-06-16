import { Button } from "@/components/ui/button";
import loyalty from "@/assets/loyalty-poster.png.asset.json";

export function Loyalty() {
  return (
    <section id="loyalty" className="bg-muted">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-hero shadow-card">
          <div className="grid items-center gap-0 lg:grid-cols-2">
            <div className="p-9 sm:p-12 lg:p-14">
              <span className="inline-flex rounded-full bg-background/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-primary-foreground">
                Kids' Nook Loyalty Program
              </span>
              <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-primary-foreground sm:text-5xl">
                Visit 5 Times,
                <span className="block text-secondary">Get The 6th Visit FREE</span>
              </h2>
              <p className="mt-5 max-w-md text-lg font-medium text-primary-foreground/90">
                Rewarding loyal families with exclusive Kids' Nook benefits, surprises and priority
                booking.
              </p>
              <Button variant="sun" size="xl" className="mt-7" asChild>
                <a href="#booking">Join Loyalty Program</a>
              </Button>
            </div>
            <div className="h-full">
              <img
                src={loyalty.url}
                alt="Kids' Nook loyalty program — visit 5, get the 6th free"
                width={1000}
                height={1100}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
