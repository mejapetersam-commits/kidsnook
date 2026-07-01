import { Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/site-data";
import logo from "@/assets/logo.jpeg";
import girl from "@/assets/girl-glasses.png";
import mother from "@/assets/mother-child.png";
import birthday from "@/assets/birthday.png";
import loyaltyPoster from "@/assets/loyalty-poster.png";
import happyKid from "@/assets/happy-kid.png";
import kidsPlaying from "@/assets/kids-playing.png";

const items = [
  {
    src: girl,
    cat: "Happy Kids",
    alt: "Smiling girl with braided hair and colorful glasses at Kids' Nook",
    tall: true,
    contain: false,
  },
  {
    src: mother,
    cat: "Family Moments",
    alt: "Mother and child taking a selfie together at Kids' Nook",
    tall: true,
    contain: false,
  },
  {
    src: birthday,
    cat: "Birthday Events",
    alt: "Birthday celebration setup at Kids' Nook",
    tall: true,
    contain: false,
  },
  {
    src: loyaltyPoster,
    cat: "Loyalty Program",
    alt: "KIDS' NOOK loyalty program poster",
    tall: false,
    contain: false,
  },
  {
    src: happyKid,
    cat: "Styled Looks",
    alt: "Happy child with purple braids and glasses at Kids' Nook",
    tall: true,
    contain: false,
  },
  {
    src: kidsPlaying,
    cat: "Outdoor Fun",
    alt: "Children playing on outdoor equipment at Kids' Nook",
    tall: true,
    contain: false,
  },
  {
    src: logo,
    cat: "KIDS' NOOK",
    alt: "KIDS' NOOK brand logo",
    tall: false,
    contain: true,
  },
];

const categories = [
  "Happy Kids",
  "Family Moments",
  "Birthday Events",
  "Loyalty Program",
  "Styled Looks",
  "Outdoor Fun",
  "KIDS' NOOK",
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

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {items.map((it, i) => (
          <figure
            key={i}
            className="group relative break-inside-avoid overflow-hidden rounded-3xl bg-muted shadow-soft"
          >
            <img
              src={it.src}
              alt={it.alt}
              loading="lazy"
              className={`w-full transition-transform duration-500 group-hover:scale-105 ${
                it.contain
                  ? "aspect-square object-contain bg-background p-6"
                  : it.tall
                    ? "aspect-[3/4] object-cover"
                    : "aspect-square object-cover"
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
