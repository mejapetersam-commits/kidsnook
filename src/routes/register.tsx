import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Baby, Users, Phone, HeartPulse, Sparkles } from "lucide-react";
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
import { MembershipSuccess } from "@/components/site/MembershipSuccess";
import {
  ConsentCheckboxes,
  emptyConsent,
  validateConsent,
  type Consent,
} from "@/components/site/ConsentCheckboxes";
import { registerMember } from "@/lib/members.functions";
import { cn } from "@/lib/utils";

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

type Form = {
  // child
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  // parent / guardian
  parent_name: string;
  parent_relationship: string;
  parent_phone: string;
  parent_email: string;
  home_address: string;
  // emergency contact
  ec_name: string;
  ec_relationship: string;
  ec_phone: string;
  ec_alt_phone: string;
  // medical
  allergies: string;
  medical_conditions: string;
  doctor_name: string;
  doctor_phone: string;
  // services
  notes: string;
};

const emptyForm: Form = {
  first_name: "",
  last_name: "",
  dob: "",
  gender: "",
  parent_name: "",
  parent_relationship: "",
  parent_phone: "",
  parent_email: "",
  home_address: "",
  ec_name: "",
  ec_relationship: "",
  ec_phone: "",
  ec_alt_phone: "",
  allergies: "",
  medical_conditions: "",
  doctor_name: "",
  doctor_phone: "",
  notes: "",
};

const SERVICES = [
  { key: "Play Center", emoji: "🎠", label: "Play center", desc: "Indoor play, activities & supervised sessions" },
  { key: "Salon & Barber", emoji: "✂️", label: "Salon & barber", desc: "Kids haircuts, styling & grooming" },
  { key: "Nanny & Me Club", emoji: "🌿", label: "Nanny & Me Club", desc: "Structured toddler play for ages 1–3" },
] as const;

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
    const months =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return `${Math.max(months, 0)} mo`;
  }
  return `${years} yr${years === 1 ? "" : "s"}`;
}

function RegisterPage() {
  const register = useServerFn(registerMember);
  const [f, setF] = useState<Form>(emptyForm);
  const [services, setServices] = useState<string[]>([]);
  const [consent, setConsent] = useState<Consent>(emptyConsent);
  const [submitting, setSubmitting] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState<string | null>(null);

  const set = (k: keyof Form, v: string) => setF((prev) => ({ ...prev, [k]: v }));
  const age = useMemo(() => ageFromDob(f.dob), [f.dob]);

  const toggleService = (key: string, on: boolean) =>
    setServices((prev) => (on ? [...new Set([...prev, key])] : prev.filter((s) => s !== key)));

  const submit = async () => {
    if (!f.first_name.trim() || !f.last_name.trim())
      return toast.error("Please enter the child's full name.");
    if (!f.dob) return toast.error("Please enter the child's date of birth.");
    if (!f.parent_name.trim()) return toast.error("Please enter the parent/guardian name.");
    if (!f.parent_relationship) return toast.error("Please select the parent's relationship.");
    if (!f.parent_phone.trim()) return toast.error("Please enter a phone number.");
    if (!f.ec_name.trim()) return toast.error("Please enter an emergency contact name.");
    if (!f.ec_relationship.trim())
      return toast.error("Please enter the emergency contact's relationship to the child.");
    if (!f.ec_phone.trim()) return toast.error("Please enter an emergency contact phone number.");
    const cErr = validateConsent(consent);
    if (cErr) return toast.error(cErr);

    setSubmitting(true);
    try {
      const res = await register({
        data: {
          child: {
            first_name: f.first_name,
            last_name: f.last_name,
            dob: f.dob,
            sex: f.gender,
            allergies: f.allergies,
            medical_conditions: f.medical_conditions,
            doctor_name: f.doctor_name,
            doctor_phone: f.doctor_phone,
            service_preferences: services.join(", "),
            notes: f.notes,
          },
          parent: {
            name: f.parent_name,
            phone: f.parent_phone,
            email: f.parent_email,
            relationship: f.parent_relationship,
            home_address: f.home_address,
            emergency_contact: [f.ec_name, f.ec_phone].filter(Boolean).join(" · "),
            emergency_contact_name: f.ec_name,
            emergency_contact_relationship: f.ec_relationship,
            emergency_contact_phone: f.ec_phone,
            emergency_contact_alt_phone: f.ec_alt_phone,
          },
        },
      });
      setMembershipNumber(res.membershipNumber);
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
                Fill in the details below and get your unique Membership Number.
              </p>
            </div>

            <div className="mt-10 grid gap-7">
              {/* Child's information */}
              <Section
                icon={<Baby className="h-5 w-5" />}
                tone="primary"
                title="Child's information"
                subtitle="Tell us about your little one"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="first" label="First name" required>
                    <Input id="first" value={f.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="e.g. Amara" />
                  </Field>
                  <Field id="last" label="Last name" required>
                    <Input id="last" value={f.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="e.g. Wanjiru" />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field id="dob" label="Date of birth" required>
                    <Input id="dob" type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} />
                  </Field>
                  <Field id="age" label="Age">
                    <Input id="age" value={age} readOnly placeholder="Auto" className="bg-muted" />
                  </Field>
                  <Field id="gender" label="Gender">
                    <Select value={f.gender} onValueChange={(v) => set("gender", v)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </Section>

              {/* Parent / Guardian */}
              <Section
                icon={<Users className="h-5 w-5" />}
                tone="secondary"
                title="Parent / Guardian"
                subtitle="Primary contact information"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="pname" label="Full name" required>
                    <Input id="pname" value={f.parent_name} onChange={(e) => set("parent_name", e.target.value)} placeholder="e.g. Grace Kamau" />
                  </Field>
                  <Field id="prel" label="Relationship" required>
                    <Select value={f.parent_relationship} onValueChange={(v) => set("parent_relationship", v)}>
                      <SelectTrigger id="prel">
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
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="pphone" label="Phone number" required>
                    <Input id="pphone" type="tel" value={f.parent_phone} onChange={(e) => set("parent_phone", e.target.value)} placeholder="+254 7XX XXX XXX" />
                  </Field>
                  <Field id="pemail" label="Email address">
                    <Input id="pemail" type="email" value={f.parent_email} onChange={(e) => set("parent_email", e.target.value)} placeholder="grace@email.com" />
                  </Field>
                </div>
                <Field id="paddr" label="Home address">
                  <Input id="paddr" value={f.home_address} onChange={(e) => set("home_address", e.target.value)} placeholder="Estate, street, Nairobi" />
                </Field>
              </Section>

              {/* Emergency contact */}
              <Section
                icon={<Phone className="h-5 w-5" />}
                tone="destructive"
                title="Emergency contact"
                subtitle="Someone we can reach if needed"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ecname" label="Full name" required>
                    <Input id="ecname" value={f.ec_name} onChange={(e) => set("ec_name", e.target.value)} placeholder="e.g. John Mwangi" />
                  </Field>
                  <Field id="ecrel" label="Relationship to child" required>
                    <Input id="ecrel" value={f.ec_relationship} onChange={(e) => set("ec_relationship", e.target.value)} placeholder="e.g. Uncle" />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="ecphone" label="Phone number" required>
                    <Input id="ecphone" type="tel" value={f.ec_phone} onChange={(e) => set("ec_phone", e.target.value)} placeholder="+254 7XX XXX XXX" />
                  </Field>
                  <Field id="ecalt" label="Alternative phone">
                    <Input id="ecalt" type="tel" value={f.ec_alt_phone} onChange={(e) => set("ec_alt_phone", e.target.value)} placeholder="+254 7XX XXX XXX" />
                  </Field>
                </div>
              </Section>

              {/* Medical info & allergies */}
              <Section
                icon={<HeartPulse className="h-5 w-5" />}
                tone="sky"
                title="Medical info & allergies"
                subtitle="Help us keep your child safe"
              >
                <Field id="allergies" label="Known allergies">
                  <Input id="allergies" value={f.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="e.g. Peanuts, Latex — or write 'None'" />
                </Field>
                <Field id="medcond" label="Medical conditions / special needs">
                  <Textarea id="medcond" value={f.medical_conditions} onChange={(e) => set("medical_conditions", e.target.value)} placeholder="Any conditions or needs our team should know about…" rows={3} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="docname" label="Doctor's name">
                    <Input id="docname" value={f.doctor_name} onChange={(e) => set("doctor_name", e.target.value)} placeholder="Dr. Otieno" />
                  </Field>
                  <Field id="docphone" label="Doctor's phone">
                    <Input id="docphone" type="tel" value={f.doctor_phone} onChange={(e) => set("doctor_phone", e.target.value)} placeholder="+254 7XX XXX XXX" />
                  </Field>
                </div>
              </Section>

              {/* Service preference */}
              <Section
                icon={<Sparkles className="h-5 w-5" />}
                tone="primary"
                title="Service preference"
                subtitle="Select all services your child will use"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  {SERVICES.map((s) => {
                    const checked = services.includes(s.key);
                    return (
                      <label
                        key={s.key}
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-2xl border-2 p-5 transition-colors",
                          checked ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl leading-none">{s.emoji}</span>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => toggleService(s.key, v === true)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <p className="font-display text-base font-extrabold text-foreground">{s.label}</p>
                          <p className="mt-1 text-sm font-medium text-muted-foreground">{s.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <Field id="notes" label="Additional notes / requests">
                  <Textarea id="notes" value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="e.g. Preferred play times, hair texture notes, special requests…" rows={3} />
                </Field>
                <ConsentCheckboxes value={consent} onChange={setConsent} />
              </Section>

              <div className="flex justify-center pt-2">
                <Button variant="hero" size="xl" onClick={submit} disabled={submitting}>
                  {submitting ? "Registering…" : "Register my child"}
                </Button>
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

const toneMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  destructive: "bg-destructive/10 text-destructive",
  sky: "bg-sky/15 text-sky",
};

function Section({
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
    <section className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-4">
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneMap[tone])}>
          {icon}
        </span>
        <div>
          <h2 className="font-display text-xl font-extrabold text-foreground">{title}</h2>
          <p className="text-sm font-medium text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 border-t border-dashed border-border pt-6">
        <div className="grid gap-5">{children}</div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
