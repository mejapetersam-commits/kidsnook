import { 
  Scissors,
  Gamepad2,
  BookOpen,
  Trees,
  Palette,
  Shield,
  Users,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

export const WHATSAPP_NUMBER = "254716727810";
export const INSTAGRAM_URL =
  "https://www.instagram.com/kidsnooksalon?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

export const services = [
  {
    icon: Scissors,
    emoji: "💇",
    title: "Hair & Beauty",
    color: "primary" as const,
    blurb: "Expert styling that keeps your little one looking fabulous.",
    items: [
      "Braiding",
      "Cornrows",
      "Haircuts",
      "Natural Hair Care",
      "Wash & Treatment",
      "Special Occasion Styling",
    ],
  },
  {
    icon: Gamepad2,
    emoji: "🎮",
    title: "Gaming Lounge",
    color: "sky" as const,
    blurb: "Modern gaming stations for supervised entertainment while waiting.",
    items: ["PlayStation Games", "Racing Games", "Multiplayer Fun", "Educational Games"],
  },
  {
    icon: BookOpen,
    emoji: "📚",
    title: "Kids Library",
    color: "secondary" as const,
    blurb: "A cozy reading corner that encourages learning and imagination.",
    items: ["Story Books", "Educational Books", "Reading Sessions", "Creative Learning"],
  },
  {
    icon: Trees,
    emoji: "🌳",
    title: "Outdoor Activities",
    color: "primary" as const,
    blurb: "Safe outdoor experiences that help kids stay active and social.",
    items: [
      "Play Area",
      "Group Activities",
      "Interactive Games",
      "Weekend Events",
      "Birthday Events",
    ],
  },
  {
    icon: Palette,
    emoji: "🎨",
    title: "Creative Corner",
    color: "sky" as const,
    blurb: "Art and craft activities designed to inspire creativity.",
    items: ["Drawing", "Painting", "DIY Crafts", "Seasonal Projects"],
  },
];

export const whyParents = [
  {
    icon: Shield,
    title: "Safe Environment",
    text: "Every space is designed with children in mind.",
  },
  {
    icon: Users,
    title: "Professional Team",
    text: "Experienced and friendly staff.",
  },
  {
    icon: Sparkles,
    title: "One-Stop Destination",
    text: "Salon, library, gaming, and outdoor fun in one place.",
  },
  {
    icon: HeartHandshake,
    title: "Memorable Experiences",
    text: "Kids leave smiling and excited to return.",
  },
];

export const testimonials = [
  {
    quote: "My daughter never wants to leave.",
    author: "Wanjiru M.",
    role: "Mom of 2",
  },
  {
    quote: "The combination of salon and play areas is brilliant.",
    author: "Achieng O.",
    role: "Parent",
  },
  {
    quote: "Finally a place where kids are entertained while looking amazing.",
    author: "Njeri K.",
    role: "Mom of 3",
  },
];

export const serviceList = [
  "Hair & Beauty — Braiding",
  "Hair & Beauty — Cornrows",
  "Hair & Beauty — Haircut",
  "Hair & Beauty — Natural Hair Care",
  "Hair & Beauty — Wash & Treatment",
  "Special Occasion Styling",
  "Gaming Lounge Session",
  "Kids Library / Reading Session",
  "Outdoor Activities",
  "Creative Corner",
  "Birthday Event",
];
