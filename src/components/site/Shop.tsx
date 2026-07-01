import { Button } from "@/components/ui/button";

const products = [
  {
    emoji: "🧩",
    name: "Educational Toys",
    text: "Learning-focused toys that make playtime meaningful.",
  },
  {
    emoji: "🧸",
    name: "Fun Toys",
    text: "Playful favourites your child loved during their visit.",
  },
  {
    emoji: "📖",
    name: "Coloring Books",
    text: "Bright coloring books to spark creativity at home.",
  },
  {
    emoji: "🎨",
    name: "Painting Kits & Canvases",
    text: "Everything little artists need for their next masterpiece.",
  },
  {
    emoji: "👟",
    name: "Crocs",
    text: "Comfy, colorful footwear for busy little feet.",
  },
  {
    emoji: "🧦",
    name: "Anti-Slip Socks",
    text: "Safe, grippy socks perfect for play and around the house.",
  },
];

export function Shop() {
  return (
    <section id="shop" className="bg-muted">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
            Kids' Nook Shop
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Take the Fun Home
          </h2>
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            A chance to buy the toys, books, and play items your child enjoyed the most.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.name}
              className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/60"
            >
              <div className="grid aspect-[4/3] place-items-center bg-gradient-hero text-6xl">
                {p.emoji}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-extrabold text-foreground">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm font-medium text-muted-foreground">{p.text}</p>
                <Button variant="outlineHero" size="lg" className="mt-5 w-full" disabled>
                  Coming Soon
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
