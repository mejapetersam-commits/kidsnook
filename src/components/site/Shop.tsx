import { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  { emoji: "🧩", name: "Educational Toys", text: "Learning-focused toys that make playtime meaningful." },
  { emoji: "🧸", name: "Fun Toys", text: "Playful favourites your child loved during their visit." },
  { emoji: "📖", name: "Coloring Books", text: "Bright coloring books to spark creativity at home." },
  { emoji: "🎨", name: "Painting Kits & Canvases", text: "Everything little artists need for their next masterpiece." },
  { emoji: "👟", name: "Crocs", text: "Comfy, colorful footwear for busy little feet." },
  { emoji: "🧦", name: "Anti-Slip Socks", text: "Safe, grippy socks perfect for play and around the house." },
];

export function Shop() {
  const [open, setOpen] = useState(false);

  return (
    <section id="shop" className="bg-muted">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
            Kids&#39; Nook Shop
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Take the Fun Home
          </h2>
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            A chance to buy the toys, books, and play items your child enjoyed the most.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft">
          <div className="flex items-center justify-between px-8 py-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-secondary">One Category</p>
              <h3 className="mt-1 font-display text-2xl font-extrabold text-foreground">Kids&#39; Nook Store</h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{products.length} products available</p>
            </div>
            <Button variant="hero" size="lg" onClick={() => setOpen(true)} className="gap-2">
              <ShoppingCart className="h-5 w-5" />
              Browse Products
            </Button>
          </div>

          <div className="grid grid-cols-3 border-t border-border sm:grid-cols-6">
            {products.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-1 border-r border-border px-4 py-5 last:border-r-0">
                <span className="text-3xl">{p.emoji}</span>
                <span className="text-center text-xs font-bold text-foreground/70 leading-tight">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-background p-6 shadow-card sm:rounded-3xl sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-2xl font-extrabold text-foreground">Kids&#39; Nook Store</h3>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted transition hover:bg-muted/80"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <article
                  key={p.name}
                  className="flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/60"
                >
                  <div className="grid aspect-[4/3] place-items-center bg-gradient-hero text-6xl">
                    {p.emoji}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-extrabold text-foreground">{p.name}</h3>
                    <p className="mt-2 flex-1 text-sm font-medium text-muted-foreground">{p.text}</p>
                    <Button variant="outlineHero" size="lg" className="mt-5 w-full gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
