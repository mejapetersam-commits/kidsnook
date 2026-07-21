import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Lock, ClipboardList } from "lucide-react";
import { adminListEnrollments, type AdminEnrollment } from "@/lib/enrollments.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Dashboard | KIDS' NOOK" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

type EnrollmentRow = AdminEnrollment;

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e)
    return String((e as { message: unknown }).message);
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function AdminPage() {
  const listEnrollments = useServerFn(adminListEnrollments);

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);

  const loadAll = async (pw: string) => {
    setLoading(true);
    try {
      const en = await listEnrollments({ data: { password: pw } });
      setEnrollments(en as EnrollmentRow[]);
      setAuthed(true);
    } catch (e: unknown) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadAll(password);
          }}
          className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-card"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-center font-display text-2xl font-extrabold text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-center font-medium text-muted-foreground">
            Enter the admin password to continue.
          </p>
          <div className="mt-6 grid gap-2">
            <Label htmlFor="pw" className="font-bold text-foreground">
              Password
            </Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="hero" size="xl" className="mt-6 w-full" disabled={loading}>
            {loading ? "Checking…" : "Enter"}
          </Button>
        </form>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-3xl font-extrabold text-foreground">Admin Dashboard</h1>

        <div className="mt-6">
          <StatCard
            icon={<ClipboardList className="h-6 w-6" />}
            label="Total Registrations"
            value={enrollments.length}
          />
        </div>

        <div className="mt-8">
          <EnrollmentsTable enrollments={enrollments} />
        </div>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString();
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex max-w-xs items-center gap-4 rounded-2xl bg-card p-6 shadow-card">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-3xl font-extrabold text-foreground">{value}</p>
        <p className="font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

type SortDir = "asc" | "desc";

function useSort<T>(rows: T[], initial: keyof T) {
  const [key, setKey] = useState<keyof T>(initial);
  const [dir, setDir] = useState<SortDir>("desc");
  const toggle = (k: keyof T) => {
    if (k === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setKey(k);
      setDir("asc");
    }
  };
  const sorted = [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const as = av == null ? "" : String(av).toLowerCase();
    const bs = bv == null ? "" : String(bv).toLowerCase();
    if (as < bs) return dir === "asc" ? -1 : 1;
    if (as > bs) return dir === "asc" ? 1 : -1;
    return 0;
  });
  return { sorted, toggle, key, dir };
}

function SortHead<T>({
  label,
  field,
  toggle,
}: {
  label: string;
  field: keyof T;
  toggle: (k: keyof T) => void;
}) {
  return (
    <TableHead>
      <button
        onClick={() => toggle(field)}
        className="inline-flex items-center gap-1 font-bold hover:text-foreground"
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  );
}

function csvEscape(v: unknown): string {
  const s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadEnrollmentsCsv(rows: EnrollmentRow[]) {
  const headers: (keyof EnrollmentRow)[] = [
    "membership_number",
    "created_at",
    "child_full_name",
    "child_dob",
    "child_gender",
    "child_nickname",
    "parent_full_name",
    "parent_relationship",
    "parent_phone",
    "parent_email",
    "home_address",
    "ec1_name",
    "ec1_relationship",
    "ec1_phone",
    "ec2_name",
    "ec2_relationship",
    "ec2_phone",
    "allergies",
    "medications",
    "medical_conditions",
    "doctor_name",
    "doctor_phone",
    "services",
    "preferred_start_date",
    "dropoff_time",
    "consent",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kidsnook-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function EnrollmentsTable({ enrollments }: { enrollments: EnrollmentRow[] }) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const filtered = enrollments.filter((e) =>
    [
      e.membership_number,
      e.child_full_name,
      e.parent_full_name,
      e.parent_phone,
      e.parent_email,
      ...e.services,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  const { sorted, toggle } = useSort(filtered, "created_at");

  return (
    <div className="rounded-2xl bg-card p-6 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by membership #, child, parent, phone, email, service…"
          className="max-w-md"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadEnrollmentsCsv(sorted)}
          disabled={sorted.length === 0}
        >
          Download CSV ({sorted.length})
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead<EnrollmentRow> label="Member #" field="membership_number" toggle={toggle} />
              <SortHead<EnrollmentRow> label="Submitted" field="created_at" toggle={toggle} />
              <SortHead<EnrollmentRow> label="Child" field="child_full_name" toggle={toggle} />
              <SortHead<EnrollmentRow> label="Parent" field="parent_full_name" toggle={toggle} />
              <TableHead>Phone</TableHead>
              <TableHead>Services</TableHead>
              <SortHead<EnrollmentRow>
                label="Start Date"
                field="preferred_start_date"
                toggle={toggle}
              />
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((e) => (
              <Fragment key={e.id}>
                <TableRow>
                  <TableCell className="font-bold text-primary">{e.membership_number}</TableCell>
                  <TableCell>{fmt(e.created_at)}</TableCell>
                  <TableCell className="font-bold text-foreground">{e.child_full_name}</TableCell>
                  <TableCell>{e.parent_full_name}</TableCell>
                  <TableCell>{e.parent_phone}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="line-clamp-1">{e.services.join(", ") || "—"}</span>
                  </TableCell>
                  <TableCell>{e.preferred_start_date || "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded((cur) => (cur === e.id ? null : e.id))}
                    >
                      {expanded === e.id ? "Hide" : "Details"}
                    </Button>
                  </TableCell>
                </TableRow>
                {expanded === e.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted">
                      <div className="grid gap-4 py-2 sm:grid-cols-2 lg:grid-cols-3">
                        <DetailBlock title="Child">
                          <DetailRow k="Membership #" v={e.membership_number} />
                          <DetailRow k="Full name" v={e.child_full_name} />
                          <DetailRow k="DOB" v={e.child_dob} />
                          <DetailRow k="Gender" v={e.child_gender} />
                          <DetailRow k="Nickname" v={e.child_nickname} />
                        </DetailBlock>
                        <DetailBlock title="Parent / Guardian">
                          <DetailRow k="Name" v={e.parent_full_name} />
                          <DetailRow k="Relationship" v={e.parent_relationship} />
                          <DetailRow k="Phone" v={e.parent_phone} />
                          <DetailRow k="Email" v={e.parent_email} />
                          <DetailRow k="Address" v={e.home_address} />
                        </DetailBlock>
                        <DetailBlock title="Emergency Contacts">
                          <DetailRow
                            k="Contact 1"
                            v={`${e.ec1_name} (${e.ec1_relationship}) · ${e.ec1_phone}`}
                          />
                          {e.ec2_name && (
                            <DetailRow
                              k="Contact 2"
                              v={`${e.ec2_name} (${e.ec2_relationship ?? "—"}) · ${e.ec2_phone ?? "—"}`}
                            />
                          )}
                        </DetailBlock>
                        <DetailBlock title="Medical">
                          <DetailRow k="Allergies" v={e.allergies} />
                          <DetailRow k="Medications" v={e.medications} />
                          <DetailRow k="Conditions" v={e.medical_conditions} />
                          <DetailRow k="Doctor" v={e.doctor_name} />
                          <DetailRow k="Doctor phone" v={e.doctor_phone} />
                        </DetailBlock>
                        <DetailBlock title="Services & Schedule">
                          <DetailRow k="Services" v={e.services.join(", ")} />
                          <DetailRow k="Start date" v={e.preferred_start_date} />
                          <DetailRow k="Drop-off time" v={e.dropoff_time} />
                          <DetailRow k="Consent" v={e.consent ? "Yes" : "No"} />
                        </DetailBlock>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No registrations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-4">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

function DetailRow({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-semibold text-foreground">{v || "—"}</span>
    </div>
  );
}
