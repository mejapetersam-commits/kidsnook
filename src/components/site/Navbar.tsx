import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpeg";

const links = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Loyalty", href: "#loyalty" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Visit Us", href: "#visit" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="KIDS' NOOK logo"
            className="h-12 w-12 rounded-2xl object-cover sm:h-14 sm:w-14"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold text-primary sm:text-xl">
              {"KIDS\u2019 Nook"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Play · Create · Get Pampered
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-foreground/80 transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <Button variant="hero" size="lg" asChild>
            <a href="#booking">Book Appointment</a>
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-foreground/80 hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <Button variant="hero" className="mt-2" asChild>
              <a href="#booking" onClick={() => setOpen(false)}>
                Book Appointment
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
