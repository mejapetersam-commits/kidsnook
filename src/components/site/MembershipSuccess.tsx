import { motion } from "motion/react";
import { PartyPopper, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CONFETTI = ["🎉", "⭐", "🎈", "✨", "🎊", "💫"];

export function MembershipSuccess({
  membershipNumber,
  title = "Welcome to KIDS' NOOK!",
}: {
  membershipNumber: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(membershipNumber);
      setCopied(true);
      toast.success("Membership Number copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Please write it down.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card p-8 text-center shadow-card sm:p-12">
      {/* floating confetti */}
      <div className="pointer-events-none absolute inset-0">
        {CONFETTI.map((c, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl sm:text-3xl"
            style={{ left: `${8 + i * 15}%`, top: "-10%" }}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{ y: ["-10%", "120%"], opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
          >
            {c}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-sun text-secondary-foreground"
      >
        <PartyPopper className="h-10 w-10" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 font-display text-3xl font-extrabold text-foreground"
      >
        {title}
      </motion.h3>

      <p className="mt-2 font-medium text-muted-foreground">Your Membership Number is</p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: "spring" }}
        className="mx-auto mt-4 inline-flex items-center gap-3 rounded-2xl bg-primary/10 px-6 py-4"
      >
        <span className="font-display text-3xl font-extrabold tracking-wider text-primary sm:text-4xl">
          {membershipNumber}
        </span>
        <button
          onClick={copy}
          aria-label="Copy membership number"
          className="rounded-full p-2 text-primary transition-colors hover:bg-primary/20"
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </button>
      </motion.div>

      <p className="mx-auto mt-6 max-w-sm font-medium text-muted-foreground">
        We'll send this to you by SMS/email soon. Keep it safe — you'll use it for future
        bookings! ✨
      </p>
    </div>
  );
}
