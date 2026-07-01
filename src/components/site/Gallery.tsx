import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { INSTAGRAM_URL } from "@/lib/site-data";
import logo from "@/assets/logo.jpeg";
import girl from "@/assets/girl-glasses.png";
import mother from "@/assets/mother-child.png";
import birthday from "@/assets/birthday.png";
import loyaltyPoster from "@/assets/loyalty-poster.png";
import happyKid from "@/assets/happy-kid.png";
import kidsPlaying from "@/assets/kids-playing.png";

const items = [
  { src: girl, cat: "Happy Kids", alt: "Smiling girl with braided hair and colorful glasses at Kids Nook" },
  { src: mother, cat: "Family Moments", alt: "Mother and child taking a selfie together at Kids Nook" },
  { src: birthday, cat: "Birthday Events", alt: "Birthday celebration setup at Kids Nook" },
  { src: loyaltyPoster, cat: "Loyalty Program", alt: "KIDS NOOK loyalty program poster" },
  { src: happyKid, cat: "Styled Looks", alt: "Happy child with purple braids and glasses at Kids Nook" },
  { src: kidsPlaying, cat: "Outdoor Fun", alt: "Children playing on outdoor equipment at Kids Nook" },
  { src: logo, cat: "KIDS NOOK", alt: "KIDS NOOK brand logo" },
];

export function Gallery() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % items.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + items.length) % items.length), []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
          Moments at Kids Nook
        </span>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          Our Gallery
        </h2>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-3xl shadow-card">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((it, i) => (
            <div key={i} className="relative min-w-full">
              <img
                src={it.src}
                alt={it.alt}
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-6">
                <span className="text-lg font-extrabold text-primary-foreground">{it.cat}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/80 shadow-soft transition hover:bg-background"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-background/80 shadow-soft transition hover:bg-background"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-2 bg-background/60"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
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
