import { Check } from "lucide-react";
import { services } from "@/lib/site-data";

const colorMap: Record<string, { ring: string; chip: string; icon: string }> = {
  primary: {
    ring: "hover:border-primary/60",
    chip: "bg-primary text-primary-foreground",
    icon: "text-primary",
  },
  sky: {
    ring: "hover:border-sky/60",
    chip: "bg-sky text-sky-foreground",
    icon: "text-sky",
  },
  secondary: {
    ring: "hover:border-secondary/60",
    chip: "bg-secondary text-secondary-foreground",
    icon: "text-secondary",
  },
};

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
          Everything Under One Roof
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          Services &amp; Activities
        </h2>
        <p className="mt-4 text-lg font-medium text-muted-foreground">
          From fresh hairstyles to gaming, reading and creative play—there's something for every
          little one.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const c = colorMap[s.color];
          return (
            <article
              key={s.title}
              className={`group rounded-3xl border-2 border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 ${c.ring}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-3xl">
                  {s.emoji}
                </span>
                <h3 className="font-display text-xl font-extrabold text-foreground">{s.title}</h3>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{s.blurb}</p>
              <ul className="mt-5 space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.chip}`}>
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
