import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserCheck, Sparkles } from "lucide-react";
import { Stepper } from "@/components/site/Stepper";
import { MembershipSuccess } from "@/components/site/MembershipSuccess";
import { lookupMember, createBooking } from "@/lib/members.functions";
import { createEnrollment, listServices } from "@/lib/enrollments.functions";
import {
  ConsentCheckboxes,
  emptyConsent,
  validateConsent,
  type Consent,
} from "@/components/site/ConsentCheckboxes";
import { serviceList } from "@/lib/site-data";

type Mode = null | "member" | "new";
type BookingDetails = { service: string; booking_date: string; booking_time: string };
const emptyBooking: BookingDetails = { service: "", booking_date: "", booking_time: "" };

type EnrollForm = {
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
  services: string[];
  preferred_start_date: string;
  dropoff_time: string;
  consent: boolean;
};

const emptyEnroll: EnrollForm = {
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
  services: [],
  preferred_start_date: "",
  dropoff_time: "",
  consent: false,
};

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
      <Label htmlFor={id} className="font-bold text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

const ENROLL_STEPS = [
  "Child Info",
  "Parent / Guardian",
  "Emergency Contacts",
  "Medical Info",
  "Services & Consent",
];

export function Booking() {
  const lookup = useServerFn(lookupMember);
  const book = useServerFn(createBooking);
  const enroll = useServerFn(createEnrollment);
  const fetchServices = useServerFn(listServices);
  const { data: SERVICES = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => fetchServices(),
    staleTime: 5 * 60 * 1000,
  });

  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    membershipNumber: string;
    isNew: boolean;
    childName?: string;
  } | null>(null);

  const [membershipInput, setMembershipInput] = useState("");
  const [lookedUp, setLookedUp] = useState<{
    child: { first_name: string; last_name: string; membership_number: string };
    parent: { name: string } | null;
  } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [booking, setBooking] = useState<BookingDetails>(emptyBooking);
  const [consent, setConsent] = useState<Consent>(emptyConsent);
  const [enForm, setEnForm] = useState<EnrollForm>(emptyEnroll);

  const memberSteps = ["Membership", "Service", "Confirm"];

  const reset = () => {
    setMode(null);
    setStep(0);
    setMembershipInput("");
    setLookedUp(null);
    setBooking(emptyBooking);
    setConsent(emptyConsent);
    setEnForm(emptyEnroll);
    setSuccess(null);
  };

  const set = (k: keyof EnrollForm, v: string | string[] | boolean) =>
    setEnForm((f) => ({ ...f, [k]: v }));

  const toggleService = (name: string) => {
    setEnForm((f) => ({
      ...f,
      services: f.services.includes(name)
        ? f.services.filter((s) => s !== name)
        : [...f.services, name],
    }));
  };

  const validateStep = (s: number): string | null => {
    const f = enForm;
    if (s === 0) {
      if (!f.child_full_name.trim()) return "Child's full name is required.";
      if (!f.child_dob.trim()) return "Date of birth is required.";
    }
    if (s === 1) {
      if (!f.parent_full_name.trim()) return "Parent/guardian name is required.";
      if (!f.parent_relationship.trim()) return "Relationship is required.";
      if (!f.parent_phone.trim()) return "Phone number is required.";
      if (!f.parent_email.trim()) return "Email is required.";
      if (!f.home_address.trim()) return "Home address is required.";
    }
    if (s === 2) {
      if (!f.ec1_name.trim()) return "Emergency contact name is required.";
      if (!f.ec1_relationship.trim()) return "Emergency contact relationship is required.";
      if (!f.ec1_phone.trim()) return "Emergency contact phone is required.";
    }
    if (s === 3) {
      if (!f.allergies.trim()) return "Please enter allergies or write None.";
    }
    if (s === 4) {
      if (f.services.length === 0) return "Please select at least one service.";
      if (!f.preferred_start_date.trim()) return "Preferred start date is required.";
      if (!f.consent) return "You must accept the consent declaration to proceed.";
    }
    return null;
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

  const next = () => {
    if (mode === "new") {
      const err = validateStep(step);
      if (err) return toast.error(err);
    } else {
      if (step === 1 && !booking.service) return toast.error("Please choose a service.");
    }
    setStep((s) => s + 1);
  };

  const submitMember = async () => {
    const cErr = validateConsent(consent);
    if (cErr) return toast.error(cErr);
    setSubmitting(true);
    try {
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
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEnrollment = async () => {
    const err = validateStep(4);
    if (err) return toast.error(err);
    setSubmitting(true);
    try {
      await enroll({
        data: {
          ...enForm,
          consent: true as const,
        },
      });
      setSuccess({
        membershipNumber: "",
        isNew: true,
        childName: enForm.child_full_name,
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const memberIsLast = step === memberSteps.length - 1;

  return (
    <section id="booking" className="bg-muted">
      <div className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-extrabold uppercase tracking-wide text-secondary">
            Reserve a Spot
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            Book Your Child&#39;s Experience
          </h2>
          <p className="mt-4 font-medium text-muted-foreground">
            Members book in seconds. New here? Register and book in one go.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          {success ? (
            <div>
              {success.childName ? (
                <div className="rounded-3xl bg-card p-8 text-center shadow-card">
                  <div className="text-5xl">🎉</div>
                  <h3 className="mt-4 font-display text-2xl font-extrabold text-foreground">
                    Thank you — we&#39;ve received {success.childName}&#39;s registration!
                  </h3>
                  <p className="mt-3 font-medium text-muted-foreground">
                    Our team will be in touch shortly to confirm your spot.
                  </p>
                </div>
              ) : (
                <MembershipSuccess
                  membershipNumber={success.membershipNumber}
                  title="Booking received!"
                />
              )}
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
          ) : mode === "member" ? (
            <>
              <Stepper steps={memberSteps} current={step} />
              <div className="mt-8 rounded-3xl bg-card p-7 shadow-card sm:p-9">
                {step === 0 && (
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
                {step === 1 && lookedUp && (
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
                {memberIsLast && (
                  <div className="grid gap-5 mt-6">
                    <h3 className="font-display text-xl font-extrabold text-foreground">
                      Confirm your booking
                    </h3>
                    <dl className="divide-y divide-border">
                      {lookedUp && (
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
                  {memberIsLast ? (
                    <Button variant="hero" size="xl" onClick={submitMember} disabled={submitting}>
                      {submitting ? "Booking…" : "Submit Booking"}
                    </Button>
                  ) : (
                    step !== 0 && (
                      <Button variant="hero" size="xl" onClick={next}>
                        Continue
                      </Button>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Stepper steps={ENROLL_STEPS} current={step} />
              <div className="mt-8 rounded-3xl bg-card p-7 shadow-card sm:p-9">
                {step === 0 && (
                  <div className="grid gap-5">
                    <h3 className="font-display text-xl font-extrabold text-foreground">
                      Child&#39;s Information
                    </h3>
                    <Field id="cfn" label="Full Name" required>
                      <Input
                        id="cfn"
                        value={enForm.child_full_name}
                        onChange={(e) => set("child_full_name", e.target.value)}
                        placeholder="First and last name"
                      />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="cdob" label="Date of Birth" required>
                        <Input
                          id="cdob"
                          type="date"
                          value={enForm.child_dob}
                          onChange={(e) => set("child_dob", e.target.value)}
                        />
                      </Field>
                      <Field id="cgender" label="Gender">
                        <Select
                          value={enForm.child_gender}
                          onValueChange={(v) => set("child_gender", v)}
                        >
                          <SelectTrigger id="cgender">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Field id="cnick" label="Nickname (optional)">
                      <Input
                        id="cnick"
                        value={enForm.child_nickname}
                        onChange={(e) => set("child_nickname", e.target.value)}
                        placeholder="What does your child like to be called?"
                      />
                    </Field>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-5">
                    <h3 className="font-display text-xl font-extrabold text-foreground">
                      Parent / Guardian
                    </h3>
                    <Field id="pfn" label="Full Name" required>
                      <Input
                        id="pfn"
                        value={enForm.parent_full_name}
                        onChange={(e) => set("parent_full_name", e.target.value)}
                        placeholder="Your full name"
                      />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="prel" label="Relationship to Child" required>
                        <Input
                          id="prel"
                          value={enForm.parent_relationship}
                          onChange={(e) => set("parent_relationship", e.target.value)}
                          placeholder="e.g. Mother, Father, Guardian"
                        />
                      </Field>
                      <Field id="pphone" label="Phone Number" required>
                        <Input
                          id="pphone"
                          type="tel"
                          value={enForm.parent_phone}
                          onChange={(e) => set("parent_phone", e.target.value)}
                          placeholder="07XX XXX XXX"
                        />
                      </Field>
                    </div>
                    <Field id="pemail" label="Email Address" required>
                      <Input
                        id="pemail"
                        type="email"
                        value={enForm.parent_email}
                        onChange={(e) => set("parent_email", e.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>
                    <Field id="paddr" label="Home Address" required>
                      <Textarea
                        id="paddr"
                        value={enForm.home_address}
                        onChange={(e) => set("home_address", e.target.value)}
                        placeholder="Street, estate, city"
                        rows={3}
                      />
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-6">
                    <h3 className="font-display text-xl font-extrabold text-foreground">
                      Emergency Contacts
                    </h3>
                    <div className="grid gap-4 rounded-2xl border border-border p-5">
                      <p className="text-sm font-extrabold uppercase tracking-wide text-secondary">
                        Primary Contact
                      </p>
                      <Field id="ec1n" label="Full Name" required>
                        <Input
                          id="ec1n"
                          value={enForm.ec1_name}
                          onChange={(e) => set("ec1_name", e.target.value)}
                          placeholder="Full name"
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="ec1r" label="Relationship" required>
                          <Input
                            id="ec1r"
                            value={enForm.ec1_relationship}
                            onChange={(e) => set("ec1_relationship", e.target.value)}
                            placeholder="e.g. Aunt, Uncle"
                          />
                        </Field>
                        <Field id="ec1p" label="Phone" required>
                          <Input
                            id="ec1p"
                            type="tel"
                            value={enForm.ec1_phone}
                            onChange={(e) => set("ec1_phone", e.target.value)}
                            placeholder="07XX XXX XXX"
                          />
                        </Field>
                      </div>
                    </div>
                    <div className="grid gap-4 rounded-2xl border border-border p-5">
                      <p className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                        Secondary Contact (optional)
                      </p>
                      <Field id="ec2n" label="Full Name">
                        <Input
                          id="ec2n"
                          value={enForm.ec2_name}
                          onChange={(e) => set("ec2_name", e.target.value)}
                          placeholder="Full name"
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="ec2r" label="Relationship">
                          <Input
                            id="ec2r"
                            value={enForm.ec2_relationship}
                            onChange={(e) => set("ec2_relationship", e.target.value)}
                            placeholder="e.g. Grandparent"
                          />
                        </Field>
                        <Field id="ec2p" label="Phone">
                          <Input
                            id="ec2p"
                            type="tel"
                            value={enForm.ec2_phone}
                            onChange={(e) => set("ec2_phone", e.target.value)}
                            placeholder="07XX XXX XXX"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-5">
                    <h3 className="font-display text-xl font-extrabold text-foreground">
                      Medical Info & Allergies
                    </h3>
                    <Field id="allg" label="Allergies" required>
                      <Textarea
                        id="allg"
                        value={enForm.allergies}
                        onChange={(e) => set("allergies", e.target.value)}
                        placeholder="List any allergies, or write None"
                        rows={3}
                      />
                    </Field>
                    <Field id="meds" label="Medications (optional)">
                      <Textarea
                        id="meds"
                        value={enForm.medications}
                        onChange={(e) => set("medications", e.target.value)}
                        placeholder="Any medications the child takes"
                        rows={2}
                      />
                    </Field>
                    <Field id="mcond" label="Medical Conditions (optional)">
                      <Textarea
                        id="mcond"
                        value={enForm.medical_conditions}
                        onChange={(e) => set("medical_conditions", e.target.value)}
                        placeholder="Any conditions we should know about"
                        rows={2}
                      />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="docn" label="Doctor Name (optional)">
                        <Input
                          id="docn"
                          value={enForm.doctor_name}
                          onChange={(e) => set("doctor_name", e.target.value)}
                          placeholder="Dr. Name"
                        />
                      </Field>
                      <Field id="docp" label="Doctor Phone (optional)">
                        <Input
                          id="docp"
                          type="tel"
                          value={enForm.doctor_phone}
                          onChange={(e) => set("doctor_phone", e.target.value)}
                          placeholder="07XX XXX XXX"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid gap-6">
                    <h3 className="font-display text-xl font-extrabold text-foreground">
                      Service Preference & Consent
                    </h3>
                    <div className="grid gap-3">
                      <Label className="font-bold text-foreground">
                        Select Services <span className="ml-1 text-destructive">*</span>
                      </Label>
                      {servicesLoading && (
                        <p className="text-sm text-muted-foreground">Loading services…</p>
                      )}
                      {!servicesLoading && SERVICES.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No services available right now.
                        </p>
                      )}
                      {SERVICES.map((s) => (
                        <label
                          key={s.id}
                          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4 hover:bg-muted"
                        >
                          <Checkbox
                            checked={enForm.services.includes(s.name)}
                            onCheckedChange={() => toggleService(s.name)}
                            className="mt-0.5"
                          />
                          <div>
                            <p className="font-bold text-foreground">{s.name}</p>
                            {s.description && (
                              <p className="text-sm text-muted-foreground">{s.description}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="psd" label="Preferred Start Date" required>
                        <Input
                          id="psd"
                          type="date"
                          value={enForm.preferred_start_date}
                          onChange={(e) => set("preferred_start_date", e.target.value)}
                        />
                      </Field>
                      <Field id="dto" label="Preferred Drop-off Time (optional)">
                        <Input
                          id="dto"
                          type="time"
                          value={enForm.dropoff_time}
                          onChange={(e) => set("dropoff_time", e.target.value)}
                        />
                      </Field>
                    </div>
                    <div className="rounded-2xl border border-border p-5">
                      <p className="text-sm font-bold text-foreground">Consent Declaration</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        I confirm that the information provided is accurate. I consent to my child
                        participating in Kids&#39; Nook activities and authorize staff to administer
                        first aid if required. I understand the terms and conditions of enrollment.
                      </p>
                      <label className="mt-4 flex cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={enForm.consent}
                          onCheckedChange={(v) => set("consent", Boolean(v))}
                        />
                        <span className="text-sm font-semibold text-foreground">
                          I agree to the above declaration
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => (step === 0 ? reset() : setStep((s) => s - 1))}
                  >
                    {step === 0 ? "Cancel" : "Back"}
                  </Button>
                  {step === 4 ? (
                    <Button
                      variant="hero"
                      size="xl"
                      onClick={submitEnrollment}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting…" : "Submit Enrollment"}
                    </Button>
                  ) : (
                    <Button variant="hero" size="xl" onClick={next}>
                      Continue
                    </Button>
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
