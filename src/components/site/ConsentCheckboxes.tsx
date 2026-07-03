import { Checkbox } from "@/components/ui/checkbox";

export type Consent = {
  waiver: boolean;
  dataProtection: boolean;
};

export const emptyConsent: Consent = { waiver: false, dataProtection: false };

export function validateConsent(c: Consent): string | null {
  if (!c.waiver) return "Please accept the indemnity waiver to continue.";
  if (!c.dataProtection) return "Please confirm the data protection consent to continue.";
  return null;
}

export function ConsentCheckboxes({
  value,
  onChange,
}: {
  value: Consent;
  onChange: (v: Consent) => void;
}) {
  const set = (k: keyof Consent, v: boolean) => onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-5">
      <p className="text-sm font-medium italic text-muted-foreground">
        Your child’s safety is our highest priority. This waiver simply acknowledges that, despite
        careful supervision and safety measures, minor bumps and scrapes can occasionally occur
        during children’s play and activities.
      </p>

      <div className="rounded-2xl bg-muted p-5">
        <p className="font-display text-base font-extrabold text-foreground">Indemnity Waiver</p>
        <div className="mt-3 grid gap-3 text-sm font-medium text-muted-foreground">
          <p>
            I acknowledge that while KIDS’ Nook takes every reasonable precaution to provide a safe,
            clean, and well-supervised environment, children’s play and participation in
            recreational, educational, and creative activities may involve inherent risks of minor
            injury.
          </p>
          <p>
            By registering my child, I voluntarily permit them to participate in activities offered
            at KIDS’ Nook and understand these inherent risks. I agree that KIDS’ Nook, its owners,
            management, and staff shall not be held liable for any minor injuries or accidents that
            may occur during normal supervised activities, except where such injury results from
            gross negligence or willful misconduct.
          </p>
          <p>
            I confirm that I have provided accurate medical and emergency contact information and
            will inform KIDS’ Nook of any relevant health conditions, allergies, or special needs
            that may affect my child’s participation.
          </p>
        </div>
        <label className="mt-4 flex items-start gap-3">
          <Checkbox
            checked={value.waiver}
            onCheckedChange={(v) => set("waiver", v === true)}
            className="mt-1"
          />
          <span className="text-sm font-semibold text-foreground">
            By selecting this checkbox, I confirm that I have read, understood, and agree to the
            terms of this indemnity waiver.
          </span>
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-2xl bg-muted p-5">
        <Checkbox
          checked={value.dataProtection}
          onCheckedChange={(v) => set("dataProtection", v === true)}
          className="mt-1"
        />
        <span className="text-sm font-semibold text-foreground">
          I confirm that the information above is accurate, and I consent to KIDS’ Nook collecting
          and storing this data securely for the purpose of providing services to my child.
        </span>
      </label>
    </div>
  );
}
