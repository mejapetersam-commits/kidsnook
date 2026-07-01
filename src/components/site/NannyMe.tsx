import { Button } from "@/components/ui/button";

const program = [
  {
    emoji: "🌿",
    day: "Tiny Trekkers Tuesday",
    text: "Outdoor exploration, sensory awareness, and connection to nature.",
    color: "primary" as const,
  },
  {
    emoji: "💦",
    day: "Water Wednesday",
    text: "Water play focused on sensory exploration, cause and effect, and fine motor skills.",
    color: "sky" as const,
  },
  {
    emoji: "🎨",
    day: "Tiny Artists Thursday",
    text: "Creative art activities exploring textures, colors, and creativity.",
    color: "secondary" as const,
  },
  {
    emoji: "🏃",
    day: "Fitness Friday",
    text: "Gross motor development through movement, coordination, rhythm, and balance.",
    color: "primary" as const,
  },
];

const ringMap: Record<string, string> = {
  primary: "hover:border-primary/60",
  sky: "hover:border-sky/60",
  secondary: "hover:border-secondary/60",
};

export function NannyMe() {
  return (
    <section id="nanny-me" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
          For Ages 1–3 Years
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          Nanny &amp; Me Club
        </h2>
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          A safe, supervised, and structured play experience where toddlers explore and grow
          together with their nanny, guided by our trained team.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {program.map((p) => (
          <article
            key={p.day}
            className={`group rounded-3xl border-2 border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 ${ringMap[p.color]}`}
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-3xl">
              {p.emoji}
            </span>
            <h3 className="mt-4 font-display text-lg font-extrabold text-foreground">{p.day}</h3>
            <p className="mt-3 text-sm font-medium text-muted-foreground">{p.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button variant="hero" size="xl" asChild>
          <a href="#booking">Register for Nanny &amp; Me</a>
        </Button>
      </div>
    </section>
  );
}
