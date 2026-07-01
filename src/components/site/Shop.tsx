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
            Kids' Nook
