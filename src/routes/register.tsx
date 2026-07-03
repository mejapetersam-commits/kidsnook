import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
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
import { registerMember } from "@/lib/members.functions";
import {
  ConsentCheckboxes,
  emptyConsent,
  validateConsent,
  type Consent,
} from "@/components/site/ConsentCheckboxes";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Become a Member | KIDS' NOOK" },
      {
        name: "description",
        content:
          "Register your child for a KIDS' NOOK membership and get a unique Membership Number. Play. Create. Get Pampered.",
      },
    ],
  }),
  component: RegisterPage,
});

const STEPS = ["Child", "Parent", "Review"];

function RegisterPage() {
  const register = useServerFn(registerMember);
  const [step, setStep] = useState(0);
  const [child, setChild] = useState<ChildForm>(emptyChild);
  const [parent, setParent] = useState<ParentForm>(emptyParent);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState<Consent>(emptyConsent);
  const [membershipNumber, setMembershipNumber] = useState<string | null>(null);

  const next = () => {
    if (step === 0) {
      const err = validateChild(child);
      if (err) return toast.error(err);
    }
    if (step === 1) {
      const err = validateParent(parent);
      if (err) return toast.error(err);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    const err = validateConsent(consent);
    if (err) return toast.error(err);
    setSubmitting(true);
    try {
      const res = await register({ data: { child, parent } });
      setMembershipNumber(res.membershipNumber);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
        {membershipNumber ? (
          <div className="mx-auto max-w-xl">
            <MembershipSuccess membershipNumber={membershipNumber} />
            <div className="mt-8 flex justify-center">
              <Button asChild variant="outlineHero" size="xl">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
                Join the Club
              </span>
              <h1 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                Become a KIDS' NOOK Member
              </h1>
              <p className="mt-4 font-medium text-muted-foreground">
                Register in a few quick steps and get your unique Membership Number.
              </p>
            </div>

            <div className="mt-10">
              <Stepper steps={STEPS} current={step} />
            </div>

            <div className="mt-8 rounded-3xl bg-card p-7 shadow-card sm:p-9">
              {step === 0 && <ChildFields value={child} onChange={setChild} />}
              {step === 1 && <ParentFields value={parent} onChange={setParent} />}
              {step === 2 && (
                <div className="grid gap-6">
                  <Review child={child} parent={parent} />
                  <ConsentCheckboxes value={consent} onChange={setConsent} />
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {step < STEPS.length - 1 ? (
                  <Button variant="hero" size="xl" onClick={next}>
                    Continue
                  </Button>
                ) : (
                  <Button variant="hero" size="xl" onClick={submit} disabled={submitting}>
                    {submitting ? "Registering…" : "Complete Registration"}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}

function Review({ child, parent }: { child: ChildForm; parent: ParentForm }) {
  const rows: [string, string][] = [
    ["Child", `${child.first_name} ${child.last_name}`],
    ["Date of Birth", child.dob || "—"],
    ["Sex", child.sex || "—"],
    ["Allergies", child.allergies || "None"],
    ["Parent / Guardian", parent.name],
    ["Phone", parent.phone],
    ["Email", parent.email || "—"],
    ["Emergency Contact", parent.emergency_contact || "—"],
  ];
  return (
    <div className="grid gap-3">
      <h3 className="font-display text-xl font-extrabold text-foreground">Review your details</h3>
      <dl className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3">
            <dt className="font-bold text-muted-foreground">{k}</dt>
            <dd className="text-right font-semibold text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
