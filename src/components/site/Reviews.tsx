import { whyParents, testimonials } from "@/lib/site-data";
import { Quote } from "lucide-react";

export function WhyParents() {
  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
            Trusted by Families
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Why Parents Love Us
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyParents.map((w) => (
            <div key={w.title} className="rounded-3xl bg-card p-7 text-center shadow-soft">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-hero text-primary-foreground">
                <w.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-5 font-display text-lg font-extrabold text-foreground">{w.title}</h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
          Parent Reviews
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          What Families Say
        </h2>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={i}
            className="flex flex-col rounded-3xl border-2 border-border bg-card p-8 shadow-soft"
          >
            <Quote className="h-9 w-9 text-secondary" />
            <blockquote className="mt-4 font-display text-xl font-bold leading-snug text-foreground">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-hero font-extrabold text-primary-foreground">
                {t.author.charAt(0)}
              </span>
              <span>
                <span className="block font-bold text-foreground">{t.author}</span>
                <span className="block text-sm text-muted-foreground">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
