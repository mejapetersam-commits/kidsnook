import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ChildForm = {
  first_name: string;
  last_name: string;
  dob: string;
  sex: string;
  allergies: string;
};

export type ParentForm = {
  name: string;
  phone: string;
  email: string;
  emergency_contact: string;
};

export const emptyChild: ChildForm = {
  first_name: "",
  last_name: "",
  dob: "",
  sex: "",
  allergies: "",
};

export const emptyParent: ParentForm = {
  name: "",
  phone: "",
  email: "",
  emergency_contact: "",
};

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

export function ChildFields({
  value,
  onChange,
}: {
  value: ChildForm;
  onChange: (v: ChildForm) => void;
}) {
  const set = (k: keyof ChildForm, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-first" label="Child's First Name">
          <Input
            id="c-first"
            value={value.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            placeholder="First name"
          />
        </Field>
        <Field id="c-last" label="Child's Last Name">
          <Input
            id="c-last"
            value={value.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            placeholder="Last name"
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="c-dob" label="Date of Birth">
          <Input
            id="c-dob"
            type="date"
            value={value.dob}
            onChange={(e) => set("dob", e.target.value)}
          />
        </Field>
        <Field id="c-sex" label="Sex">
          <Select value={value.sex} onValueChange={(v) => set("sex", v)}>
            <SelectTrigger id="c-sex">
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
      <Field id="c-allergies" label="Allergies (optional)">
        <Input
          id="c-allergies"
          value={value.allergies}
          onChange={(e) => set("allergies", e.target.value)}
          placeholder="e.g. peanuts, none"
        />
      </Field>
    </div>
  );
}

export function ParentFields({
  value,
  onChange,
}: {
  value: ParentForm;
  onChange: (v: ParentForm) => void;
}) {
  const set = (k: keyof ParentForm, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-5">
      <Field id="p-name" label="Parent / Guardian Name">
        <Input
          id="p-name"
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Your name"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="p-phone" label="Phone Number">
          <Input
            id="p-phone"
            type="tel"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="07XX XXX XXX"
          />
        </Field>
        <Field id="p-email" label="Email (optional)">
          <Input
            id="p-email"
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
      </div>
      <Field id="p-emergency" label="Emergency Contact">
        <Input
          id="p-emergency"
          value={value.emergency_contact}
          onChange={(e) => set("emergency_contact", e.target.value)}
          placeholder="Name & phone"
        />
      </Field>
    </div>
  );
}

export function validateChild(c: ChildForm): string | null {
  if (!c.first_name.trim() || !c.last_name.trim()) return "Please enter the child's full name.";
  return null;
}

export function validateParent(p: ParentForm): string | null {
  if (!p.name.trim()) return "Please enter the parent/guardian name.";
  if (!p.phone.trim()) return "Please enter a phone number.";
  return null;
}
