import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Services } from "@/components/site/Services";
import { Loyalty } from "@/components/site/Loyalty";
import { NannyMe } from "@/components/site/NannyMe";
import { Shop } from "@/components/site/Shop";
import { Gallery } from "@/components/site/Gallery";
import { WhyParents, Testimonials } from "@/components/site/Reviews";
import { Booking } from "@/components/site/Booking";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kids' Nook | Children's Salon & Activity Center in Nairobi" },
      {
        name: "description",
        content:
          "More than a salon — haircare, gaming, library, outdoor play & creative fun for kids in Nairobi. Play. Create. Get Pampered.",
      },
      { property: "og:title", content: "Kids' Nook | A Happy Place for Kids" },
      {
        property: "og:description",
        content: "Haircare, play, creativity, and memorable experiences—all under one roof.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <NannyMe />
        <Loyalty />
        <Shop />
        <Gallery />
        <WhyParents />
        <Testimonials />
        <Booking />
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
