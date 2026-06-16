import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { serviceList, WHATSAPP_NUMBER } from "@/lib/site-data";

export function Booking() {
  const [form, setForm] = useState({
    parent: "",
    child: "",
    phone: "",
    service: "",
    date: "",
    time: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parent || !form.child || !form.phone || !form.service) {
      toast.error("Please fill in your name, child's name, phone and service.");
      return;
    }
    const msg = `Hello Kids' Nook! I'd like to book an appointment.%0A%0A👤 Parent: ${form.parent}%0A🧒 Child: ${form.child}%0A📞 Phone: ${form.phone}%0A💫 Service: ${form.service}%0A📅 Date: ${form.date || "Flexible"}%0A⏰ Time: ${form.time || "Flexible"}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    toast.success("Opening WhatsApp to confirm your booking!");
  };

  return (
    <section id="booking" className="bg-muted">
      <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
            Reserve a Spot
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Book Your Child's Experience
          </h2>
          <p className="mt-4 font-medium text-muted-foreground">
            Fill in the details and we'll confirm your booking on WhatsApp.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mt-10 grid gap-5 rounded-3xl bg-card p-7 shadow-card sm:p-9"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="parent" label="Parent Name">
              <Input
                id="parent"
                value={form.parent}
                onChange={(e) => update("parent", e.target.value)}
                placeholder="Your name"
              />
            </Field>
            <Field id="child" label="Child Name">
              <Input
                id="child"
                value={form.child}
                onChange={(e) => update("child", e.target.value)}
                placeholder="Child's name"
              />
            </Field>
          </div>

          <Field id="phone" label="Phone Number">
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="07XX XXX XXX"
            />
          </Field>

          <Field id="service" label="Service">
            <Select value={form.service} onValueChange={(v) => update("service", v)}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {serviceList.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="date" label="Preferred Date">
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </Field>
            <Field id="time" label="Preferred Time">
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
              />
            </Field>
          </div>

          <Button type="submit" variant="hero" size="xl" className="mt-2 w-full">
            Book Now
          </Button>
        </form>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="font-bold text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
