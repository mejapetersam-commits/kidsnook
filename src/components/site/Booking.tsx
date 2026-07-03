import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
import { UserCheck, Sparkles } from "lucide-react";
import { serviceList } from "@/lib/site-data";
import { Stepper } from "@/components/site/Stepper";
import { MembershipSuccess } from "@/components/site/MembershipSuccess";
import {
  ChildFields,
  ParentFields,
  emptyChild,
  emptyParent,
  validateChild,
  validateParent,
  type ChildForm,
  type ParentForm,
} from "@/components/site/member-fields";
import { lookupMember, createBooking, registerAndBook } from "@/lib/members.functions";
import {
  ConsentCheckboxes,
  emptyConsent,
  validateConsent,
  type Consent,
} from "@/components/site/ConsentCheckboxes";

type Mode = null | "member" | "new";
type BookingDetails = { service: string; booking_date: string; booking_time: string };

const emptyBooking: BookingDetails = { service: "", booking_date: "", booking_time: "" };

export function Booking() {
  const lookup = useServerFn(lookupMember);
  const book = useServerFn(createBooking);
  const registerBook = useServerFn(registerAndBook);

  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ membershipNumber: string; isNew: boolean } | null>(null);

  // member path
  const [membershipInput, setMembershipInput] = useState("");
  const [lookedUp, setLookedUp] = useState<{
    child: { first_name: string; last_name: string; membership_number: string };
    parent: { name: string } | null;
  } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // new client path
  const [child, setChild] = useState<ChildForm>(emptyChild);
  const [parent, setParent] = useState<ParentForm>(emptyParent);

  // shared
  const [booking, setBooking] = useState<BookingDetails>(emptyBooking);
  const [consent, setConsent] = useState<Consent>(emptyConsent);

  const memberSteps = ["Membership", "Service", "Confirm"];
  const newSteps = ["Child", "Parent", "Service", "Confirm"];
  const steps = mode === "member" ? memberSteps : newSteps;

  const reset = () => {
    setMode(null);
    setStep(0);
    setMembershipInput("");
    setLookedUp(null);
    setChild(emptyChild);
    setParent(emptyParent);
    setBooking(emptyBooking);
    setConsent(emptyConsent);
    setSuccess(null);
  };

  const doLookup = async () => {
    if (!membershipInput.trim()) return toast.error("Please enter your Membership Number.");
    setLookingUp(true);
    try {
      const res = await lookup({ data: { membership_number: membershipInput.trim() } });
      if (!res.found) {
        toast.error("Membership Number not found. Please check and try again.");
        setLookedUp(null);
        return;
      }
      setLookedUp({ child: res.child, parent: res.parent });
      setStep(1);
    } catch {
      toast.error("Lookup failed. Please try again.");
    } finally {
      setLookingUp(false);
    }
  };

  const validateService = () => {
    if (!booking.service) {
      toast.error("Please choose a service.");
      return false;
    }
    return true;
  };

  const next = () => {
    if (mode === "member") {
      if (step === 1 && !validateService()) return;
    } else {
      if (step === 0) {
        const err = validateChild(child);
        if (err) return toast.error(err);
      }
      if (step === 1) {
        const err = validateParent(parent);
        if (err) return toast.error(err);
      }
      if (step === 2 && !validateService()) return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = async () => {
    const cErr = validateConsent(consent);
    if (cErr) return toast.error(cErr);
    setSubmitting(true);
    try {
      if (mode === "member") {
        const res = await book({
          data: {
            membership_number: membershipInput.trim(),
            service: booking.service,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            waiver_accepted: consent.waiver,
          },
        });
        setSuccess({ membershipNumber: res.membershipNumber, isNew: false });
      } else {
        const res = await registerBook({
          data: {
            child,
            parent,
            booking: {
              service: booking.service,
              booking_date: booking.booking_date,
              booking_time: booking.booking_time,
              waiver_accepted: consent.waiver,
            },
          },
        });
        setSuccess({ membershipNumber: res.membershipNumber, isNew: true });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === steps.length - 1;

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
            Members book in seconds. New here? Register and book in one go.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          {success ? (
            <div>
              <MembershipSuccess
                membershipNumber={success.membershipNumber}
                title={success.isNew ? "You're booked & now a member!" : "Booking received!"}
              />
              <div className="mt-8 flex justify-center">
                <Button variant="outlineHero" size="xl" onClick={reset}>
                  Make Another Booking
                </Button>
              </div>
            </div>
          ) : mode === null ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <PathCard
                icon={<UserCheck className="h-8 w-8" />}
                title="Existing Member"
                desc="Enter your Membership Number to book fast."
                onClick={() => {
                  setMode("member");
                  setStep(0);
                }}
              />
              <PathCard
                icon={<Sparkles className="h-8 w-8" />}
                title="New Client"
                desc="Register your child and book in one step."
                onClick={() => {
                  setMode("new");
                  setStep(0);
                }}
              />
            </div>
          ) : (
            <>
              <Stepper steps={steps} current={step} />
              <div className="mt-8 rounded-3xl bg-card p-7 shadow-card sm:p-9">
                {/* MEMBER PATH */}
                {mode === "member" && step === 0 && (
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="mnum" className="font-bold text-foreground">
                        Membership Number
                      </Label>
                      <Input
                        id="mnum"
                        value={membershipInput}
                        onChange={(e) => setMembershipInput(e.target.value)}
                        placeholder="KN-000001"
                      />
                    </div>
                    <Button variant="hero" size="xl" onClick={doLookup} disabled={lookingUp}>
                      {lookingUp ? "Looking up…" : "Find My Details"}
                    </Button>
                  </div>
                )}

                {mode === "member" && step === 1 && lookedUp && (
                  <div className="grid gap-6">
                    <div className="rounded-2xl bg-primary/10 p-5">
                      <p className="text-sm font-bold text-primary">Member found 🎉</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {lookedUp.child.first_name} {lookedUp.child.last_name} ·{" "}
                        {lookedUp.child.membership_number}
                      </p>
                      {lookedUp.parent && (
                        <p className="text-sm font-medium text-muted-foreground">
                          Parent: {lookedUp.parent.name}
                        </p>
                      )}
                    </div>
                    <ServiceFields value={booking} onChange={setBooking} />
                  </div>
                )}

                {/* NEW CLIENT PATH */}
                {mode === "new" && step === 0 && (
                  <ChildFields value={child} onChange={setChild} />
                )}
                {mode === "new" && step === 1 && (
                  <ParentFields value={parent} onChange={setParent} />
                )}
                {mode === "new" && step === 2 && (
                  <ServiceFields value={booking} onChange={setBooking} />
                )}

                {/* CONFIRM STEP (both paths) */}
                {isLastStep && (
                  <div className="grid gap-5">
                    <h3 className="font-display text-xl font-extrabold text-foreground">
                      Confirm your booking
                    </h3>
                    <dl className="divide-y divide-border">
                      {mode === "new" && (
                        <Row k="Child" v={`${child.first_name} ${child.last_name}`} />
                      )}
                      {mode === "member" && lookedUp && (
                        <Row
                          k="Child"
                          v={`${lookedUp.child.first_name} ${lookedUp.child.last_name}`}
                        />
                      )}
                      <Row k="Service" v={booking.service || "—"} />
                      <Row k="Date" v={booking.booking_date || "Flexible"} />
                      <Row k="Time" v={booking.booking_time || "Flexible"} />
                    </dl>
                    <ConsentCheckboxes value={consent} onChange={setConsent} />
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => (step === 0 ? reset() : setStep((s) => s - 1))}
                  >
                    {step === 0 ? "Cancel" : "Back"}
                  </Button>
                  {isLastStep ? (
                    <Button variant="hero" size="xl" onClick={submit} disabled={submitting}>
                      {submitting ? "Booking…" : "Submit Booking"}
                    </Button>
                  ) : (
                    // member step 0 uses its own lookup button; hide Continue there
                    !(mode === "member" && step === 0) && (
                      <Button variant="hero" size="xl" onClick={next}>
                        Continue
                      </Button>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PathCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-3xl bg-card p-7 text-left shadow-card transition-all hover:-translate-y-1"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </span>
      <span className="font-display text-xl font-extrabold text-foreground">{title}</span>
      <span className="font-medium text-muted-foreground">{desc}</span>
    </button>
  );
}

function ServiceFields({
  value,
  onChange,
}: {
  value: BookingDetails;
  onChange: (v: BookingDetails) => void;
}) {
  const set = (k: keyof BookingDetails, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="svc" className="font-bold text-foreground">
          Service
        </Label>
        <Select value={value.service} onValueChange={(v) => set("service", v)}>
          <SelectTrigger id="svc">
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
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="bdate" className="font-bold text-foreground">
            Preferred Date
          </Label>
          <Input
            id="bdate"
            type="date"
            value={value.booking_date}
            onChange={(e) => set("booking_date", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="btime" className="font-bold text-foreground">
            Preferred Time
          </Label>
          <Input
            id="btime"
            type="time"
            value={value.booking_time}
            onChange={(e) => set("booking_time", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="font-bold text-muted-foreground">{k}</dt>
      <dd className="text-right font-semibold text-foreground">{v}</dd>
    </div>
  );
}
