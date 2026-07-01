import mother from "@/assets/mother-child.png";

export function About() {
  return (
    <section id="about" className="bg-muted">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <div className="relative">
          <img
            src={mother}
            alt="Mother and child taking a happy selfie at Kids' Nook"
            width={1000}
            height={900}
            loading="lazy"
            className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-card"
          />
        </div>

        <div>
          <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
            About Kids' Nook
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            Where Kids Come to Play, Learn &amp; Shine
          </h2>
          <p className="mt-5 text-lg font-medium text-muted-foreground">
            Kids' Nook is a unique destination designed for children to express themselves through
            beauty, creativity, reading, gaming, and outdoor adventures.
          </p>
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Whether it's a fresh hairstyle, a gaming session, story time in the library, or fun
            outdoor activities, every visit becomes an experience.
          </p>

          <div className="mt-7 grid grid-cols-3 gap-4">
            {[
              { n: "5", l: "Fun Zones" },
              { n: "100%", l: "Kid-Safe" },
              { n: "7", l: "Days a Week" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-background p-4 text-center shadow-soft">
                <p className="font-display text-2xl font-extrabold text-primary">{s.n}</p>
                <p className="text-xs font-bold text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
