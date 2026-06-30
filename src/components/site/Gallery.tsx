import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/site-data";
import girl from "@/assets/girl-glasses.png";
import mother from "@/assets/mother-child.png";
import birthday from "@/assets/birthday.png";
import gaming from "@/assets/gaming.jpg";
import library from "@/assets/library.jpg";
import outdoor from "@/assets/outdoor.jpg";
import creative from "@/assets/creative.jpg";
import hair from "@/assets/hair.jpg";

const items = [
  { src: hair, cat: "Hairstyles", tall: false },
  { src: girl.url, cat: "Happy Kids", tall: true },
  { src: gaming, cat: "Gaming Lounge", tall: false },
  { src: library, cat: "Reading Corner", tall: true },
  { src: outdoor, cat: "Outdoor Fun", tall: false },
  { src: creative, cat: "Activities", tall: true },
  { src: birthday.url, cat: "Birthday Events", tall: false },
  { src: mother.url, cat: "Happy Kids", tall: false },
];

const categories = [
  "Hairstyles",
  "Happy Kids",
  "Activities",
  "Reading Corner",
  "Outdoor Fun",
  "Gaming Lounge",
];

export function Gallery() {
  return (
    <section id="gallery" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
          Moments at Kids' Nook
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          Our Gallery
        </h2>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <span
            key={c}
            className="rounded-full bg-muted px-4 py-1.5 text-xs font-bold text-foreground/70"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-10 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
        {items.map((it, i) => (
          <figure
            key={i}
            className="group relative break-inside-avoid overflow-hidden rounded-3xl shadow-soft"
          >
            <img
              src={it.src}
              alt={`${it.cat} at Kids' Nook`}
              loading="lazy"
              className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                it.tall ? "aspect-[3/4]" : "aspect-square"
              }`}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-4">
              <span className="text-sm font-extrabold text-primary-foreground">{it.cat}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-sun px-6 py-3 font-bold text-secondary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Instagram className="h-5 w-5" />
          Follow @kidsnooksalon
        </a>
      </div>
    </section>
  );
}
