import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Baby, Users, Phone, HeartPulse, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Stepper } from "@/components/site/Stepper";
import { MembershipSuccess } from "@/components/site/MembershipSuccess";
import {
  ConsentCheckboxes,
  emptyConsent,
  validateConsent,
  type Consent,
} from "@/components/site/ConsentCheckboxes";
import { listServices, createEnrollment, type Service } from "@/lib/enrollments.functions";
import { cn } from "@/lib/utils";

const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => listServices(),
});

export const Route = createFileRoute("/enroll")({
  head: () => ({
    meta: [
      { title: "Child Enrollment | KIDS' NOOK" },
      {
        name: "description",
        content:
          "Enroll your child at KIDS' NOOK with our simple step-by-step registration form. Play. Create. Get Pampered.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: EnrollPage,
  errorComponent: ({ error }) => (
    <div
      role="alert"
      className="mx-auto max-w-md p-10 text-center font-medium text-muted-foreground"
    >
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Page not found.</div>,
});

type Form = {
  child_full_name: string;
  child_dob: string;
  child_gender: string;
  child_nickname: string;
  parent_full_name: string;
  parent_relationship: string;
  parent_phone: string;
  parent_email: string;
  home_address: string;
  ec1_name: string;
  ec1_relationship: string;
  ec1_phone: string;
  ec2_name: string;
  ec2_relationship: string;
  ec2_phone: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  doctor_name: string;
  doctor_phone: string;
  preferred_start_date: string;
  dropoff_time: string;
};

const emptyForm: Form = {
  child_full_name: "",
  child_dob: "",
  child_gender: "",
  child_nickname: "",
  parent_full_name: "",
  parent_relationship: "",
  parent_phone: "",
  parent_email: "",
  home_address: "",
  ec1_name: "",
  ec1_relationship: "",
  ec1_phone: "",
  ec2_name: "",
  ec2_relationship: "",
  ec2_phone: "",
  allergies: "",
  medications: "",
  medical_conditions: "",
  doctor_name: "",
  doctor_phone: "",
  preferred_start_date: "",
  dropoff_time: "",
};

const STEPS = ["Child", "Guardian", "Emergency", "Medical", "Services"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,}$/;

function EnrollPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const submitFn = useServerFn(createEnrollment);

  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(emptyForm);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [consent, setConsent] = useState<Consent>(emptyConsent);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState("");

  const set = (k: keyof Form, v: string) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => (prev[k] ? { ...prev, [k]: "" } : prev));
  };

  const toggleService = (name: string, on: boolean) => {
    setSelectedServices((prev) =>
      on ? [...new Set([...prev, name])] : prev.filter((s) => s !== name),
    );
    setErrors((prev) => (prev.services ? { ...prev, services: "" } : prev));
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!f.child_full_name.trim()) e.child_full_name = "Child's full name is required.";
      if (!f.child_dob) e.child_dob = "Date of birth is required.";
    } else if (s === 1) {
      if (!f.parent_full_name.trim()) e.parent_full_name = "Full name is required.";
      if (!f.parent_relationship) e.parent_relationship = "Please select a relationship.";
      if (!f.parent_phone.trim()) e.parent_phone = "Phone number is required.";
      else if (!PHONE_RE.test(f.parent_phone.trim()))
        e.parent_phone = "Enter a valid phone number.";
      if (!f.parent_email.trim()) e.parent_email = "Email is required.";
      else if (!EMAIL_RE.test(f.parent_email.trim()))
        e.parent_email = "Enter a valid email address.";
      if (!f.home_address.trim()) e.home_address = "Home address is required.";
    } else if (s === 2) {
      if (!f.ec1_name.trim()) e.ec1_name = "Emergency contact name is required.";
      if (!f.ec1_relationship.trim()) e.ec1_relationship = "Relationship is required.";
      if (!f.ec1_phone.trim()) e.ec1_phone = "Phone number is required.";
      else if (!PHONE_RE.test(f.ec1_phone.trim())) e.ec1_phone = "Enter a valid phone number.";
      if (f.ec2_phone.trim() && !PHONE_RE.test(f.ec2_phone.trim()))
        e.ec2_phone = "Enter a valid phone number.";
    } else if (s === 3) {
      if (!f.allergies.trim()) e.allergies = 'Please enter allergies, or write "None".';
    } else if (s === 4) {
      if (selectedServices.length === 0) e.services = "Please select at least one service.";
      if (!f.preferred_start_date) e.preferred_start_date = "Preferred start date is required.";
      const consentErr = validateConsent(consent);
      if (consentErr) e.consent = consentErr;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    else window.scrollTo({ top: 120, behavior: "smooth" });
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const res = await submitFn({
        data: {
          ...f,
          services: selectedServices,
          consent: true as const,
        },
      });
      setMembershipNumber(res.membershipNumber);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 py-16 lg:py-24">
        {done ? (
          <ConfirmationCard
            childName={f.child_full_name.trim()}
            membershipNumber={membershipNumber}
          />
        ) : (
          <>
            <div className="text-center">
              <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
                Enrollment
              </span>
              <h1 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                Child Enrollment Form
              </h1>
              <p className="mt-4 font-medium text-muted-foreground">
                A few quick steps and your little one is all set.
              </p>
            </div>

            <div className="mt-10">
              <Stepper steps={STEPS} current={step} />
              <p className="mt-4 text-center text-sm font-bold text-muted-foreground">
                Step {step + 1} of {STEPS.length} — {STEP_TITLES[step]}
              </p>
            </div>

            <div className="mt-8 rounded-3xl bg-card p-6 shadow-card sm:p-8">
              {step === 0 && <StepChild f={f} set={set} errors={errors} />}
              {step === 1 && <StepGuardian f={f} set={set} errors={errors} />}
              {step === 2 && <StepEmergency f={f} set={set} errors={errors} />}
              {step === 3 && <StepMedical f={f} set={set} errors={errors} />}
              {step === 4 && (
                <StepServices
                  f={f}
                  set={set}
                  errors={errors}
                  services={services}
                  selected={selectedServices}
                  toggle={toggleService}
                  consent={consent}
                  setConsent={(v) => {
                    setConsent(v);
                    setErrors((prev) => (prev.consent ? { ...prev, consent: "" } : prev));
                  }}
                />
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 0 ? (
                <Button variant="outline" size="lg" onClick={back} disabled={submitting}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              ) : (
                <span />
              )}
              {step < STEPS.length - 1 ? (
                <Button variant="hero" size="lg" onClick={next}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="hero" size="lg" onClick={submit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit enrollment"}
                </Button>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}

const STEP_TITLES = [
  "Child's Information",
  "Parent / Guardian",
  "Emergency Contacts",
  "Medical Info & Allergies",
  "Service Preference & Consent",
];

// ---------- Steps ----------
type StepProps = {
  f: Form;
  set: (k: keyof Form, v: string) => void;
  errors: Record<string, string>;
};

function ageFromDob(dob: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
  if (years < 0) return "";
  if (years < 1) {
    const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return `${Math.max(months, 0)} months`;
  }
  return `${years} year${years === 1 ? "" : "s"} old`;
}

function StepChild({ f, set, errors }: StepProps) {
  const age = useMemo(() => ageFromDob(f.child_dob), [f.child_dob]);
  return (
    <StepShell
      icon={<Baby className="h-5 w-5" />}
      tone="primary"
      title="Child's Information"
      subtitle="Tell us about your little one"
    >
      <Field id="child_full_name" label="Full name" required error={errors.child_full_name}>
        <Input
          id="child_full_name"
          value={f.child_full_name}
          onChange={(e) => set("child_full_name", e.target.value)}
          placeholder="e.g. Amara Wanjiru"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="child_dob"
          label="Date of birth"
          required
          error={errors.child_dob}
          hint={age || undefined}
        >
          <Input
            id="child_dob"
            type="date"
            value={f.child_dob}
            onChange={(e) => set("child_dob", e.target.value)}
          />
        </Field>
        <Field id="child_gender" label="Gender" optional>
          <Select value={f.child_gender} onValueChange={(v) => set("child_gender", v)}>
            <SelectTrigger id="child_gender">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field id="child_nickname" label="Preferred name / nickname" optional>
        <Input
          id="child_nickname"
          value={f.child_nickname}
          onChange={(e) => set("child_nickname", e.target.value)}
          placeholder="e.g. Ama"
        />
      </Field>
    </StepShell>
  );
}

function StepGuardian({ f, set, errors }: StepProps) {
  return (
    <StepShell
      icon={<Users className="h-5 w-5" />}
      tone="secondary"
      title="Parent / Guardian"
      subtitle="Primary contact information"
    >
      <Field id="parent_full_name" label="Full name" required error={errors.parent_full_name}>
        <Input
          id="parent_full_name"
          value={f.parent_full_name}
          onChange={(e) => set("parent_full_name", e.target.value)}
          placeholder="e.g. Grace Kamau"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="parent_relationship"
          label="Relationship to child"
          required
          error={errors.parent_relationship}
        >
          <Select
            value={f.parent_relationship}
            onValueChange={(v) => set("parent_relationship", v)}
          >
            <SelectTrigger id="parent_relationship">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mother">Mother</SelectItem>
              <SelectItem value="Father">Father</SelectItem>
              <SelectItem value="Guardian">Guardian</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field id="parent_phone" label="Phone number" required error={errors.parent_phone}>
          <Input
            id="parent_phone"
            type="tel"
            value={f.parent_phone}
            onChange={(e) => set("parent_phone", e.target.value)}
            placeholder="+254 7XX XXX XXX"
          />
        </Field>
      </div>
      <Field id="parent_email" label="Email address" required error={errors.parent_email}>
        <Input
          id="parent_email"
          type="email"
          value={f.parent_email}
          onChange={(e) => set("parent_email", e.target.value)}
          placeholder="grace@email.com"
        />
      </Field>
      <Field id="home_address" label="Home address" required error={errors.home_address}>
        <Textarea
          id="home_address"
          value={f.home_address}
          onChange={(e) => set("home_address", e.target.value)}
          placeholder="Estate, street, city"
          rows={3}
        />
      </Field>
    </StepShell>
  );
}

function StepEmergency({ f, set, errors }: StepProps) {
  return (
    <StepShell
      icon={<Phone className="h-5 w-5" />}
      tone="destructive"
      title="Emergency Contacts"
      subtitle="People we can reach if we can't reach you"
    >
      <div className="rounded-2xl border-2 border-border p-5">
        <p className="mb-4 font-display text-base font-extrabold text-foreground">
          Emergency Contact 1
        </p>
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="ec1_name" label="Full name" required error={errors.ec1_name}>
              <Input
                id="ec1_name"
                value={f.ec1_name}
                onChange={(e) => set("ec1_name", e.target.value)}
                placeholder="e.g. John Mwangi"
              />
            </Field>
            <Field
              id="ec1_relationship"
              label="Relationship"
              required
              error={errors.ec1_relationship}
            >
              <Input
                id="ec1_relationship"
                value={f.ec1_relationship}
                onChange={(e) => set("ec1_relationship", e.target.value)}
                placeholder="e.g. Uncle"
              />
            </Field>
          </div>
          <Field id="ec1_phone" label="Phone number" required error={errors.ec1_phone}>
            <Input
              id="ec1_phone"
              type="tel"
              value={f.ec1_phone}
              onChange={(e) => set("ec1_phone", e.target.value)}
              placeholder="+254 7XX XXX XXX"
            />
          </Field>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-border p-5">
        <p className="mb-4 font-display text-base font-extrabold text-foreground">
          Emergency Contact 2{" "}
          <span className="text-sm font-medium text-muted-foreground">(optional)</span>
        </p>
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="ec2_name" label="Full name" optional>
              <Input
                id="ec2_name"
                value={f.ec2_name}
                onChange={(e) => set("ec2_name", e.target.value)}
                placeholder="e.g. Mary Njeri"
              />
            </Field>
            <Field id="ec2_relationship" label="Relationship" optional>
              <Input
                id="ec2_relationship"
                value={f.ec2_relationship}
                onChange={(e) => set("ec2_relationship", e.target.value)}
                placeholder="e.g. Aunt"
              />
            </Field>
          </div>
          <Field id="ec2_phone" label="Phone number" optional error={errors.ec2_phone}>
            <Input
              id="ec2_phone"
              type="tel"
              value={f.ec2_phone}
              onChange={(e) => set("ec2_phone", e.target.value)}
              placeholder="+254 7XX XXX XXX"
            />
          </Field>
        </div>
      </div>
    </StepShell>
  );
}

function StepMedical({ f, set, errors }: StepProps) {
  return (
    <StepShell
      icon={<HeartPulse className="h-5 w-5" />}
      tone="sky"
      title="Medical Info & Allergies"
      subtitle="Help us keep your child safe"
    >
      <Field
        id="allergies"
        label="Known allergies"
        required
        error={errors.allergies}
        hint='Enter "None" if not applicable'
      >
        <Textarea
          id="allergies"
          value={f.allergies}
          onChange={(e) => set("allergies", e.target.value)}
          placeholder="e.g. Peanuts, latex — or write 'None'"
          rows={2}
        />
      </Field>
      <Field id="medications" label="Current medications" optional>
        <Textarea
          id="medications"
          value={f.medications}
          onChange={(e) => set("medications", e.target.value)}
          placeholder="Any medications your child is currently taking…"
          rows={2}
        />
      </Field>
      <Field id="medical_conditions" label="Medical conditions" optional>
        <Textarea
          id="medical_conditions"
          value={f.medical_conditions}
          onChange={(e) => set("medical_conditions", e.target.value)}
          placeholder="Any conditions or special needs our team should know about…"
          rows={2}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="doctor_name" label="Doctor's name" optional>
          <Input
            id="doctor_name"
            value={f.doctor_name}
            onChange={(e) => set("doctor_name", e.target.value)}
            placeholder="Dr. Otieno"
          />
        </Field>
        <Field id="doctor_phone" label="Doctor's phone number" optional>
          <Input
            id="doctor_phone"
            type="tel"
            value={f.doctor_phone}
            onChange={(e) => set("doctor_phone", e.target.value)}
            placeholder="+254 7XX XXX XXX"
          />
        </Field>
      </div>
    </StepShell>
  );
}

function StepServices({
  f,
  set,
  errors,
  services,
  selected,
  toggle,
  consent,
  setConsent,
}: StepProps & {
  services: Service[];
  selected: string[];
  toggle: (name: string, on: boolean) => void;
  consent: Consent;
  setConsent: (v: Consent) => void;
}) {
  return (
    <StepShell
      icon={<Sparkles className="h-5 w-5" />}
      tone="primary"
      title="Service Preference & Consent"
      subtitle="Select all services your child will use"
    >
      <div>
        <Label className="text-sm font-bold text-foreground">
          Services <span className="text-destructive">*</span>
        </Label>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {services.map((s) => {
            const checked = selected.includes(s.name);
            return (
              <label
                key={s.id}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition-colors",
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => toggle(s.name, v === true)}
                  className="mt-1"
                />
                <div>
                  <p className="font-display text-base font-extrabold text-foreground">{s.name}</p>
                  {s.description && (
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      {s.description}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        {errors.services && (
          <p className="mt-2 text-sm font-semibold text-destructive">{errors.services}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="preferred_start_date"
          label="Preferred start date"
          required
          error={errors.preferred_start_date}
        >
          <Input
            id="preferred_start_date"
            type="date"
            value={f.preferred_start_date}
            onChange={(e) => set("preferred_start_date", e.target.value)}
          />
        </Field>
        <Field id="dropoff_time" label="Typical drop-off time" optional>
          <Input
            id="dropoff_time"
            type="time"
            value={f.dropoff_time}
            onChange={(e) => set("dropoff_time", e.target.value)}
          />
        </Field>
      </div>

      <ConsentCheckboxes value={consent} onChange={setConsent} />
      {errors.consent && (
        <p className="-mt-2 text-sm font-semibold text-destructive">{errors.consent}</p>
      )}
    </StepShell>
  );
}

// ---------- Shared UI ----------
const toneMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  destructive: "bg-destructive/10 text-destructive",
  sky: "bg-sky/15 text-sky",
};

function StepShell({
  icon,
  tone,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneMap[tone])}>
          {icon}
        </span>
        <div>
          <h2 className="font-display text-xl font-extrabold text-foreground">{title}</h2>
          <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-5 border-t border-dashed border-border pt-6">{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  optional,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-bold text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
        {optional && <span className="font-medium text-muted-foreground"> (optional)</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-sm font-semibold text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm font-medium text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ConfirmationCard({
  childName,
  membershipNumber,
}: {
  childName: string;
  membershipNumber: string;
}) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <MembershipSuccess
        membershipNumber={membershipNumber}
        title={`Thank you — we've received ${childName ? `${childName}'s` : "your child's"} registration`}
      />
      <p className="mt-4 font-medium text-muted-foreground">
        Our team will be in touch shortly to confirm the next steps. Welcome to the KIDS' NOOK
        family!
      </p>
      <div className="mt-8 flex justify-center">
        <Button asChild variant="outlineHero" size="xl">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
