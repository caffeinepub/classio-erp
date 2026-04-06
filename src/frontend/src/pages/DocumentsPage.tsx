import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Award,
  CreditCard,
  FileBadge,
  FileCheck,
  FileText,
  GraduationCap,
  IdCard,
  Printer,
  RefreshCw,
  School,
  Stamp,
} from "lucide-react";
import { useRef, useState } from "react";
import { useAllStudents } from "../hooks/useQueries";
import {
  AdmissionBoardExtraFields,
  BOARD_BADGE_COLORS,
  BOARD_DOCUMENT_TYPES,
  type BoardDocType,
  BoardDocumentForm,
  BoardDocumentPreview,
  BoardSelector,
  type BoardType,
  TCBoardExtraFields,
} from "./BoardDocuments";

const SCHOOL_NAME =
  localStorage.getItem("classio_school_name") || "ABC Public School";
const SCHOOL_LOGO =
  localStorage.getItem("classio_school_logo") ||
  "/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg";
const SCHOOL_ADDRESS =
  localStorage.getItem("classio_school_address") ||
  "123, School Road, City - 400001, Maharashtra, India";
const SCHOOL_PHONE =
  localStorage.getItem("classio_school_phone") || "Phone: +91-XXXXXXXXXX";
const SCHOOL_EMAIL =
  localStorage.getItem("classio_school_email") || "info@school.edu.in";
const SCHOOL_AFFILIATION =
  localStorage.getItem("classio_school_affiliation") ||
  "Affiliation No: XXXXXXXX";

type DocumentType =
  | "tc"
  | "admission"
  | "bonafide"
  | "character"
  | "migration"
  | "fee-receipt"
  | "leaving"
  | "id-card"
  | "progress-report"
  | "noc";

interface DocumentCard {
  id: DocumentType;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const DOCUMENT_TYPES: DocumentCard[] = [
  {
    id: "tc",
    title: "Transfer Certificate",
    description:
      "Official TC for students leaving the school, required for admission elsewhere.",
    icon: FileText,
    badge: "Mandatory",
  },
  {
    id: "admission",
    title: "Admission Form",
    description:
      "Comprehensive admission form with parent details, documents checklist and declaration.",
    icon: School,
    badge: "Mandatory",
  },
  {
    id: "bonafide",
    title: "Bonafide Certificate",
    description:
      "Certifies current student enrollment for bank, passport, or study purposes.",
    icon: FileCheck,
    badge: "Common",
  },
  {
    id: "character",
    title: "Character Certificate",
    description:
      "Attests to student conduct and character during tenure at the school.",
    icon: Award,
    badge: "Common",
  },
  {
    id: "migration",
    title: "Migration Certificate",
    description:
      "Required when a student migrates to another board or state board examination.",
    icon: FileBadge,
    badge: "Board",
  },
  {
    id: "fee-receipt",
    title: "Fee Receipt",
    description:
      "Official receipt for fee payments including tuition, activity, and transport fees.",
    icon: CreditCard,
    badge: "Finance",
  },
  {
    id: "leaving",
    title: "School Leaving Certificate",
    description:
      "Issued when a student leaves the school before completing the course.",
    icon: GraduationCap,
    badge: "Mandatory",
  },
  {
    id: "id-card",
    title: "Student Identity Card",
    description:
      "Official photo ID card for students with contact and grade information.",
    icon: IdCard,
    badge: "Annual",
  },
  {
    id: "progress-report",
    title: "Progress Report / Report Card",
    description:
      "Term-wise academic performance report with subject marks, grades, and remarks.",
    icon: BarChartIcon,
    badge: "Academic",
  },
  {
    id: "noc",
    title: "No Objection Certificate",
    description:
      "NOC issued for students seeking admission to another institution or activity.",
    icon: Stamp,
    badge: "Admin",
  },
];

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="presentation"
      {...props}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

const BADGE_COLORS: Record<string, string> = {
  Mandatory: "bg-red-50 text-red-700 border-red-200",
  Common: "bg-blue-50 text-blue-700 border-blue-200",
  Board: "bg-purple-50 text-purple-700 border-purple-200",
  Finance: "bg-green-50 text-green-700 border-green-200",
  Annual: "bg-orange-50 text-orange-700 border-orange-200",
  Academic: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Admin: "bg-gray-50 text-gray-700 border-gray-200",
};

// ── Helper for grade calculation ──────────────────────────────────────────────
function getGradeLetter(pct: number): string {
  if (pct >= 90) return "A1";
  if (pct >= 80) return "A2";
  if (pct >= 70) return "B1";
  if (pct >= 60) return "B2";
  if (pct >= 50) return "C1";
  if (pct >= 40) return "C2";
  return "D";
}

function autoReceiptNo() {
  return `RCP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ── Print styles injected once ─────────────────────────────────────────────────
const PRINT_STYLE = `
@media print {
  body > * { display: none !important; }
  #print-document { display: block !important; }
  #print-document { position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: visible; }
  @page { margin: 10mm; size: A4 portrait; }
}
#print-document { display: none; }
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("doc-print-style")
) {
  const style = document.createElement("style");
  style.id = "doc-print-style";
  style.textContent = PRINT_STYLE;
  document.head.appendChild(style);
}

// ─── School Header for all printed docs ──────────────────────────────────────
function SchoolHeader() {
  return (
    <div className="flex items-start gap-4 pb-4 border-b-2 border-gray-800 mb-5">
      <img
        src={SCHOOL_LOGO}
        alt="School Logo"
        className="w-16 h-16 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
          {SCHOOL_NAME}
        </h1>
        <p className="text-sm text-gray-600">{SCHOOL_ADDRESS}</p>
        <p className="text-xs text-gray-500">
          {SCHOOL_PHONE} | {SCHOOL_EMAIL}
        </p>
        <p className="text-xs text-gray-500">{SCHOOL_AFFILIATION}</p>
      </div>
    </div>
  );
}

function DocTitle({ title }: { title: string }) {
  return (
    <div className="text-center mb-5">
      <h2 className="text-lg font-bold uppercase tracking-widest underline underline-offset-4 text-gray-900">
        {title}
      </h2>
    </div>
  );
}

function SignatureRow({ labels }: { labels: string[] }) {
  return (
    <div
      className="flex justify-between mt-12 pt-4 border-t border-gray-300"
      style={{ marginTop: "3rem" }}
    >
      {labels.map((lbl) => (
        <div key={lbl} className="text-center">
          <div className="border-t border-gray-600 pt-1 w-32 mx-auto text-xs text-gray-600">
            {lbl}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Student Selector ─────────────────────────────────────────────────────────
function StudentSelector({
  onSelect,
}: {
  onSelect: (data: Record<string, string>) => void;
}) {
  const { data: students = [], isLoading } = useAllStudents();
  const [selectedId, setSelectedId] = useState("");

  const handleChange = (id: string) => {
    setSelectedId(id);
    const s = students.find((st) => st.id === id);
    if (!s) return;
    let dobStr = "";
    if (s.dob !== null && s.dob !== undefined) {
      const ts = Number(s.dob);
      const ms = ts > 1e12 ? ts / 1_000_000 : ts;
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) dobStr = d.toISOString().split("T")[0];
    }
    onSelect({
      studentName: `${s.firstName} ${s.lastName}`,
      firstName: s.firstName,
      lastName: s.lastName,
      grade: String(s.grade ?? ""),
      dob: dobStr,
      parentName: String(s.parentName ?? ""),
      contactPhone: String(s.contactPhone ?? ""),
      contactEmail: String(s.contactEmail ?? ""),
      studentId: s.id,
    });
  };

  return (
    <Field label="Select Student (Auto-fill)">
      <Select value={selectedId} onValueChange={handleChange}>
        <SelectTrigger data-ocid="documents.student.select" className="w-full">
          <SelectValue
            placeholder={
              isLoading
                ? "Loading students..."
                : "Choose a student to auto-fill"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {students.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.firstName} {s.lastName} — Class {s.grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 1 — Transfer Certificate
// ═══════════════════════════════════════════════════════════════════
function TCForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>({
    serialNo: `TC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    studentName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    admissionNo: "",
    dateOfAdmission: "",
    classLastStudied: "",
    dateOfLeaving: todayStr(),
    totalAttendance: "",
    workingDays: "",
    reasonForLeaving: "",
    conduct: "Good",
    feesPaid: "Yes",
    eligibleForReadmission: "Yes",
    remarks: "",
    place: "",
    date: todayStr(),
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({
            ...p,
            studentName: d.studentName,
            dob: d.dob,
            grade: d.grade,
            classLastStudied: d.grade,
          }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Serial/TC Number">
          <Input
            value={form.serialNo}
            onChange={set("serialNo")}
            data-ocid="tc.serial.input"
          />
        </Field>
        <Field label="Admission Number">
          <Input
            value={form.admissionNo}
            onChange={set("admissionNo")}
            data-ocid="tc.admission_no.input"
          />
        </Field>
        <Field label="Student Full Name">
          <Input
            value={form.studentName}
            onChange={set("studentName")}
            data-ocid="tc.student_name.input"
          />
        </Field>
        <Field label="Father's Name">
          <Input
            value={form.fatherName}
            onChange={set("fatherName")}
            data-ocid="tc.father_name.input"
          />
        </Field>
        <Field label="Mother's Name">
          <Input
            value={form.motherName}
            onChange={set("motherName")}
            data-ocid="tc.mother_name.input"
          />
        </Field>
        <Field label="Date of Birth">
          <Input
            type="date"
            value={form.dob}
            onChange={set("dob")}
            data-ocid="tc.dob.input"
          />
        </Field>
        <Field label="Date of Admission">
          <Input
            type="date"
            value={form.dateOfAdmission}
            onChange={set("dateOfAdmission")}
            data-ocid="tc.date_admission.input"
          />
        </Field>
        <Field label="Class Last Studied">
          <Input
            value={form.classLastStudied}
            onChange={set("classLastStudied")}
            data-ocid="tc.class_last.input"
          />
        </Field>
        <Field label="Date of Leaving">
          <Input
            type="date"
            value={form.dateOfLeaving}
            onChange={set("dateOfLeaving")}
            data-ocid="tc.date_leaving.input"
          />
        </Field>
        <Field label="Total Attendance (Days)">
          <Input
            value={form.totalAttendance}
            onChange={set("totalAttendance")}
            placeholder="e.g. 215"
            data-ocid="tc.attendance.input"
          />
        </Field>
        <Field label="Total Working Days">
          <Input
            value={form.workingDays}
            onChange={set("workingDays")}
            placeholder="e.g. 240"
            data-ocid="tc.working_days.input"
          />
        </Field>
        <Field label="Reason for Leaving">
          <Input
            value={form.reasonForLeaving}
            onChange={set("reasonForLeaving")}
            data-ocid="tc.reason.input"
          />
        </Field>
        <Field label="Conduct">
          <Select
            value={form.conduct}
            onValueChange={(v) => setForm((p) => ({ ...p, conduct: v }))}
          >
            <SelectTrigger data-ocid="tc.conduct.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Excellent", "Good", "Satisfactory"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Fees Paid Clearance">
          <Select
            value={form.feesPaid}
            onValueChange={(v) => setForm((p) => ({ ...p, feesPaid: v }))}
          >
            <SelectTrigger data-ocid="tc.fees_paid.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Eligible for Re-admission">
          <Select
            value={form.eligibleForReadmission}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, eligibleForReadmission: v }))
            }
          >
            <SelectTrigger data-ocid="tc.readmission.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Place">
          <Input
            value={form.place}
            onChange={set("place")}
            data-ocid="tc.place.input"
          />
        </Field>
        <Field label="Date of Issue">
          <Input
            type="date"
            value={form.date}
            onChange={set("date")}
            data-ocid="tc.issue_date.input"
          />
        </Field>
      </div>
      <Field label="Remarks">
        <Textarea
          value={form.remarks}
          onChange={set("remarks")}
          rows={2}
          data-ocid="tc.remarks.textarea"
        />
      </Field>
      <Button
        className="w-full"
        data-ocid="tc.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function TCPreview({ data }: { data: Record<string, string> }) {
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="Transfer Certificate" />
      <table
        className="w-full border-collapse text-sm"
        style={{ borderCollapse: "collapse" }}
      >
        <tbody>
          {[
            ["Serial No. / TC No.", data.serialNo],
            ["Admission No.", data.admissionNo],
            ["Name of Student", data.studentName],
            ["Father's Name", data.fatherName],
            ["Mother's Name", data.motherName],
            ["Date of Birth", formatDate(data.dob)],
            ["Date of Admission", formatDate(data.dateOfAdmission)],
            ["Class in which last studied", data.classLastStudied],
            ["Date of Leaving", formatDate(data.dateOfLeaving)],
            [
              "Total Attendance",
              `${data.totalAttendance} days out of ${data.workingDays} working days`,
            ],
            ["Reason for Leaving", data.reasonForLeaving],
            ["Conduct", data.conduct],
            ["Fees Paid Clearance", data.feesPaid],
            ["Eligible for Re-admission", data.eligibleForReadmission],
            ["Remarks", data.remarks],
          ].map(([label, value]) => (
            <tr key={label} className="border border-gray-300">
              <td className="font-medium bg-gray-50 px-3 py-1.5 w-2/5 border border-gray-300">
                {label}
              </td>
              <td className="px-3 py-1.5 border border-gray-300">
                {value || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4 text-sm">
        <span>Place: {data.place}</span>
        <span>Date: {formatDate(data.date)}</span>
      </div>
      <SignatureRow
        labels={["Class Teacher", "Examination Cell", "Principal"]}
      />
      <p className="text-center text-xs text-gray-400 mt-4">
        This is a computer-generated Transfer Certificate. Valid with school
        seal.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 2 — Admission Form
// ═══════════════════════════════════════════════════════════════════
function AdmissionForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string | boolean>) => void }) {
  const [form, setForm] = useState<Record<string, string | boolean>>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    religion: "",
    category: "General",
    aadhar: "",
    mobile: "",
    email: "",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    fatherName: "",
    fatherOccupation: "",
    fatherMobile: "",
    motherName: "",
    motherOccupation: "",
    motherMobile: "",
    guardianName: "",
    prevSchool: "",
    prevClass: "",
    prevBoard: "",
    tcNo: "",
    medicalConditions: "",
    docBirthCert: false,
    docAadhar: false,
    docTC: false,
    docMarksheet: false,
    docPhotos: false,
    declaration: false,
    admissionClass: "",
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k: string) => setForm((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-5">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({
            ...p,
            firstName: d.firstName,
            lastName: d.lastName,
            dob: d.dob,
            admissionClass: d.grade,
            fatherName: d.parentName,
            mobile: d.contactPhone,
          }))
        }
      />
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Student Information
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name">
            <Input
              value={String(form.firstName)}
              onChange={set("firstName")}
              data-ocid="admission.first_name.input"
            />
          </Field>
          <Field label="Last Name">
            <Input
              value={String(form.lastName)}
              onChange={set("lastName")}
              data-ocid="admission.last_name.input"
            />
          </Field>
          <Field label="Date of Birth">
            <Input
              type="date"
              value={String(form.dob)}
              onChange={set("dob")}
              data-ocid="admission.dob.input"
            />
          </Field>
          <Field label="Gender">
            <Select
              value={String(form.gender)}
              onValueChange={(v) => setForm((p) => ({ ...p, gender: v }))}
            >
              <SelectTrigger data-ocid="admission.gender.select">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Blood Group">
            <Input
              value={String(form.bloodGroup)}
              onChange={set("bloodGroup")}
              placeholder="e.g. B+"
              data-ocid="admission.blood_group.input"
            />
          </Field>
          <Field label="Religion">
            <Input
              value={String(form.religion)}
              onChange={set("religion")}
              data-ocid="admission.religion.input"
            />
          </Field>
          <Field label="Caste / Category">
            <Select
              value={String(form.category)}
              onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger data-ocid="admission.category.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["General", "OBC", "SC", "ST"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Aadhar Number">
            <Input
              value={String(form.aadhar)}
              onChange={set("aadhar")}
              placeholder="XXXX XXXX XXXX"
              data-ocid="admission.aadhar.input"
            />
          </Field>
          <Field label="Mobile">
            <Input
              value={String(form.mobile)}
              onChange={set("mobile")}
              data-ocid="admission.mobile.input"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={String(form.email)}
              onChange={set("email")}
              data-ocid="admission.email.input"
            />
          </Field>
          <Field label="Applying for Class">
            <Input
              value={String(form.admissionClass)}
              onChange={set("admissionClass")}
              data-ocid="admission.class.input"
            />
          </Field>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Address
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="House No / Flat">
            <Input
              value={String(form.houseNo)}
              onChange={set("houseNo")}
              data-ocid="admission.house_no.input"
            />
          </Field>
          <Field label="Street / Area">
            <Input
              value={String(form.street)}
              onChange={set("street")}
              data-ocid="admission.street.input"
            />
          </Field>
          <Field label="City">
            <Input
              value={String(form.city)}
              onChange={set("city")}
              data-ocid="admission.city.input"
            />
          </Field>
          <Field label="State">
            <Input
              value={String(form.state)}
              onChange={set("state")}
              data-ocid="admission.state.input"
            />
          </Field>
          <Field label="Pincode">
            <Input
              value={String(form.pincode)}
              onChange={set("pincode")}
              data-ocid="admission.pincode.input"
            />
          </Field>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Parent / Guardian Details
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Father's Name">
            <Input
              value={String(form.fatherName)}
              onChange={set("fatherName")}
              data-ocid="admission.father_name.input"
            />
          </Field>
          <Field label="Father's Occupation">
            <Input
              value={String(form.fatherOccupation)}
              onChange={set("fatherOccupation")}
              data-ocid="admission.father_occ.input"
            />
          </Field>
          <Field label="Father's Mobile">
            <Input
              value={String(form.fatherMobile)}
              onChange={set("fatherMobile")}
              data-ocid="admission.father_mobile.input"
            />
          </Field>
          <Field label="Mother's Name">
            <Input
              value={String(form.motherName)}
              onChange={set("motherName")}
              data-ocid="admission.mother_name.input"
            />
          </Field>
          <Field label="Mother's Occupation">
            <Input
              value={String(form.motherOccupation)}
              onChange={set("motherOccupation")}
              data-ocid="admission.mother_occ.input"
            />
          </Field>
          <Field label="Mother's Mobile">
            <Input
              value={String(form.motherMobile)}
              onChange={set("motherMobile")}
              data-ocid="admission.mother_mobile.input"
            />
          </Field>
          <Field label="Guardian Name (if diff.)">
            <Input
              value={String(form.guardianName)}
              onChange={set("guardianName")}
              data-ocid="admission.guardian_name.input"
            />
          </Field>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Previous School Details
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Previous School Name">
            <Input
              value={String(form.prevSchool)}
              onChange={set("prevSchool")}
              data-ocid="admission.prev_school.input"
            />
          </Field>
          <Field label="Previous Class">
            <Input
              value={String(form.prevClass)}
              onChange={set("prevClass")}
              data-ocid="admission.prev_class.input"
            />
          </Field>
          <Field label="Previous Board">
            <Select
              value={String(form.prevBoard)}
              onValueChange={(v) => setForm((p) => ({ ...p, prevBoard: v }))}
            >
              <SelectTrigger data-ocid="admission.prev_board.select">
                <SelectValue placeholder="Select Board" />
              </SelectTrigger>
              <SelectContent>
                {["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"].map(
                  (b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </Field>
          <Field label="TC Number">
            <Input
              value={String(form.tcNo)}
              onChange={set("tcNo")}
              data-ocid="admission.tc_no.input"
            />
          </Field>
        </div>
      </div>
      <Field label="Medical Conditions / Allergies">
        <Textarea
          value={String(form.medicalConditions)}
          onChange={set("medicalConditions")}
          rows={2}
          placeholder="None / describe..."
          data-ocid="admission.medical.textarea"
        />
      </Field>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
          Documents Submitted
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "docBirthCert", label: "Birth Certificate" },
            { key: "docAadhar", label: "Aadhar Card" },
            { key: "docTC", label: "Transfer Certificate (TC)" },
            { key: "docMarksheet", label: "Previous Mark Sheet" },
            { key: "docPhotos", label: "Passport Photographs" },
          ].map(({ key, label }) => (
            <label
              key={key}
              htmlFor={`doccheck-${key}`}
              className="flex items-center gap-2 text-sm cursor-pointer"
              data-ocid={`admission.${key}.checkbox`}
            >
              <Checkbox
                id={`doccheck-${key}`}
                checked={Boolean(form[key])}
                onCheckedChange={() => toggle(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="declaration"
          checked={Boolean(form.declaration)}
          onCheckedChange={() => toggle("declaration")}
          data-ocid="admission.declaration.checkbox"
        />
        <label
          htmlFor="declaration"
          className="text-xs text-muted-foreground cursor-pointer"
        >
          I hereby declare that the information furnished above is true and
          correct to the best of my knowledge and belief.
        </label>
      </div>
      <Button
        className="w-full"
        data-ocid="admission.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function AdmissionPreview({
  data,
}: { data: Record<string, string | boolean> }) {
  const docChecks = [
    { key: "docBirthCert", label: "Birth Certificate" },
    { key: "docAadhar", label: "Aadhar Card" },
    { key: "docTC", label: "TC" },
    { key: "docMarksheet", label: "Mark Sheet" },
    { key: "docPhotos", label: "Passport Photos" },
  ];
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="Admission Form" />
      <div
        className="border border-gray-300 p-3 mb-4 inline-block float-right text-center text-gray-400 text-xs"
        style={{ width: 90, height: 110 }}
      >
        Photograph
      </div>
      <table
        className="w-full border-collapse text-sm"
        style={{ borderCollapse: "collapse" }}
      >
        <tbody>
          {[
            ["Full Name", `${data.firstName} ${data.lastName}`],
            ["Date of Birth", formatDate(String(data.dob))],
            ["Gender", data.gender],
            ["Blood Group", data.bloodGroup],
            ["Religion", data.religion],
            ["Category", data.category],
            ["Aadhar No.", data.aadhar],
            ["Mobile", data.mobile],
            ["Email", data.email],
            ["Applying for Class", data.admissionClass],
            [
              "Address",
              `${data.houseNo}, ${data.street}, ${data.city}, ${data.state} - ${data.pincode}`,
            ],
            ["Father's Name", data.fatherName],
            ["Father's Occupation", data.fatherOccupation],
            ["Father's Mobile", data.fatherMobile],
            ["Mother's Name", data.motherName],
            ["Mother's Occupation", data.motherOccupation],
            ["Mother's Mobile", data.motherMobile],
            ["Guardian (if diff.)", data.guardianName],
            ["Previous School", data.prevSchool],
            ["Previous Class", data.prevClass],
            ["Previous Board", data.prevBoard],
            ["TC Number", data.tcNo],
            ["Medical Conditions", data.medicalConditions],
          ].map(([label, value]) => (
            <tr key={String(label)} className="border border-gray-300">
              <td className="font-medium bg-gray-50 px-3 py-1.5 w-2/5 border border-gray-300">
                {label}
              </td>
              <td className="px-3 py-1.5 border border-gray-300">
                {String(value) || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <strong className="text-xs uppercase tracking-wide">
          Documents Submitted:
        </strong>
        <div className="flex flex-wrap gap-3 mt-1">
          {docChecks.map(({ key, label }) => (
            <span key={key} className="flex items-center gap-1 text-xs">
              <span className="inline-block w-3 h-3 border border-gray-600 text-center leading-3">
                {data[key] ? "✓" : ""}
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-600 italic">
        Declaration: I hereby declare that the information furnished above is
        true and correct.
      </div>
      <SignatureRow labels={["Parent/Guardian", "Verified By", "Principal"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 3 — Bonafide Certificate
// ═══════════════════════════════════════════════════════════════════
function BonafideForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    rollNumber: "",
    academicYear: "",
    purpose: "Study purpose",
    issueDate: todayStr(),
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({ ...p, studentName: d.studentName, grade: d.grade }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={form.studentName}
            onChange={set("studentName")}
            data-ocid="bonafide.student_name.input"
          />
        </Field>
        <Field label="Class / Grade">
          <Input
            value={form.grade}
            onChange={set("grade")}
            data-ocid="bonafide.grade.input"
          />
        </Field>
        <Field label="Roll Number">
          <Input
            value={form.rollNumber}
            onChange={set("rollNumber")}
            data-ocid="bonafide.roll_no.input"
          />
        </Field>
        <Field label="Academic Year">
          <Input
            value={form.academicYear}
            placeholder="2024-2025"
            onChange={set("academicYear")}
            data-ocid="bonafide.academic_year.input"
          />
        </Field>
        <Field label="Purpose">
          <Select
            value={form.purpose}
            onValueChange={(v) => setForm((p) => ({ ...p, purpose: v }))}
          >
            <SelectTrigger data-ocid="bonafide.purpose.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Study purpose",
                "Bank account",
                "Passport",
                "Visa",
                "Scholarship",
                "Other",
              ].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of Issue">
          <Input
            type="date"
            value={form.issueDate}
            onChange={set("issueDate")}
            data-ocid="bonafide.issue_date.input"
          />
        </Field>
      </div>
      <Button
        className="w-full"
        data-ocid="bonafide.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function BonafidePreview({ data }: { data: Record<string, string> }) {
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="Bonafide Certificate" />
      <div className="text-center mb-4">
        <span className="text-xs bg-gray-100 border border-gray-300 px-3 py-1 rounded">
          Ref. No.:{" "}
          {data.refNo || `BCN-${new Date().getFullYear()}-${form3Ref(data)}`}
        </span>
      </div>
      <p className="leading-relaxed text-justify mb-4">
        This is to certify that{" "}
        <strong>{data.studentName || "______________"}</strong> (Roll No.:{" "}
        {data.rollNumber || "______"}) is a <em>bonafide</em> student of this
        school, studying in <strong>Class {data.grade || "______"}</strong>{" "}
        during the Academic Year{" "}
        <strong>{data.academicYear || "______-______"}</strong>.
      </p>
      <p className="leading-relaxed text-justify mb-4">
        This certificate is being issued for the purpose of{" "}
        <strong>{data.purpose || "study purpose"}</strong> on the request of the
        student / parent.
      </p>
      <p className="leading-relaxed text-justify">
        The Principal / Management of {SCHOOL_NAME} vouches for the character
        and conduct of the student.
      </p>
      <div className="flex justify-between mt-4 text-sm">
        <span>Date of Issue: {formatDate(data.issueDate)}</span>
        <span>Place: {SCHOOL_ADDRESS.split(",")[2] || ""}</span>
      </div>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
    </div>
  );
}
function form3Ref(data: Record<string, string>) {
  return String((data.studentName || "").charCodeAt(0) || 0).padStart(3, "0");
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 4 — Character Certificate
// ═══════════════════════════════════════════════════════════════════
function CharacterForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    rollNumber: "",
    academicYear: "",
    issueDate: todayStr(),
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({ ...p, studentName: d.studentName, grade: d.grade }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={form.studentName}
            onChange={set("studentName")}
            data-ocid="character.student_name.input"
          />
        </Field>
        <Field label="Class / Grade">
          <Input
            value={form.grade}
            onChange={set("grade")}
            data-ocid="character.grade.input"
          />
        </Field>
        <Field label="Roll Number">
          <Input
            value={form.rollNumber}
            onChange={set("rollNumber")}
            data-ocid="character.roll_no.input"
          />
        </Field>
        <Field label="Academic Year">
          <Input
            value={form.academicYear}
            placeholder="2024-2025"
            onChange={set("academicYear")}
            data-ocid="character.academic_year.input"
          />
        </Field>
        <Field label="Date of Issue">
          <Input
            type="date"
            value={form.issueDate}
            onChange={set("issueDate")}
            data-ocid="character.issue_date.input"
          />
        </Field>
      </div>
      <Button
        className="w-full"
        data-ocid="character.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function CharacterPreview({ data }: { data: Record<string, string> }) {
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="Character Certificate" />
      <p className="leading-relaxed text-justify mb-4">
        This is to certify that{" "}
        <strong>{data.studentName || "______________"}</strong>, a student of{" "}
        <strong>Class {data.grade || "______"}</strong> (Roll No.:{" "}
        {data.rollNumber || "______"}), during the Academic Year{" "}
        <strong>{data.academicYear || "______-______"}</strong>, has been found
        to be of <em>good moral character and conduct</em> during his/her period
        of study in this institution.
      </p>
      <p className="leading-relaxed text-justify mb-4">
        He/She has always been respectful, disciplined, and well-behaved. There
        has been no complaint of misconduct against him/her during his/her
        tenure at the school.
      </p>
      <p className="leading-relaxed text-justify">
        We wish him/her all success in his/her future endeavours.
      </p>
      <div className="flex justify-between mt-4 text-sm">
        <span>Date: {formatDate(data.issueDate)}</span>
      </div>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 5 — Migration Certificate
// ═══════════════════════════════════════════════════════════════════
function MigrationForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({
    studentName: "",
    fatherName: "",
    admissionNo: "",
    grade: "",
    board: "CBSE",
    yearOfPassing: "",
    marksObtained: "",
    subjects: "",
    reasonForMigration: "",
    destinationState: "",
    destinationSchool: "",
    issueDate: todayStr(),
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({ ...p, studentName: d.studentName, grade: d.grade }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={form.studentName}
            onChange={set("studentName")}
            data-ocid="migration.student_name.input"
          />
        </Field>
        <Field label="Father's Name">
          <Input
            value={form.fatherName}
            onChange={set("fatherName")}
            data-ocid="migration.father_name.input"
          />
        </Field>
        <Field label="Admission No.">
          <Input
            value={form.admissionNo}
            onChange={set("admissionNo")}
            data-ocid="migration.admission_no.input"
          />
        </Field>
        <Field label="Class">
          <Input
            value={form.grade}
            onChange={set("grade")}
            data-ocid="migration.grade.input"
          />
        </Field>
        <Field label="Board of Examination">
          <Select
            value={form.board}
            onValueChange={(v) => setForm((p) => ({ ...p, board: v }))}
          >
            <SelectTrigger data-ocid="migration.board.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["CBSE", "ICSE", "State Board", "IB", "IGCSE"].map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Year of Passing">
          <Input
            value={form.yearOfPassing}
            onChange={set("yearOfPassing")}
            placeholder="2024"
            data-ocid="migration.year.input"
          />
        </Field>
        <Field label="Marks Obtained">
          <Input
            value={form.marksObtained}
            onChange={set("marksObtained")}
            placeholder="e.g. 450/500"
            data-ocid="migration.marks.input"
          />
        </Field>
        <Field label="Destination State">
          <Input
            value={form.destinationState}
            onChange={set("destinationState")}
            data-ocid="migration.dest_state.input"
          />
        </Field>
        <Field label="Destination School (if known)">
          <Input
            value={form.destinationSchool}
            onChange={set("destinationSchool")}
            data-ocid="migration.dest_school.input"
          />
        </Field>
        <Field label="Date of Issue">
          <Input
            type="date"
            value={form.issueDate}
            onChange={set("issueDate")}
            data-ocid="migration.issue_date.input"
          />
        </Field>
      </div>
      <Field label="Subjects">
        <Textarea
          value={form.subjects}
          onChange={set("subjects")}
          rows={2}
          placeholder="e.g. English, Hindi, Mathematics, Science, Social Studies"
          data-ocid="migration.subjects.textarea"
        />
      </Field>
      <Field label="Reason for Migration">
        <Textarea
          value={form.reasonForMigration}
          onChange={set("reasonForMigration")}
          rows={2}
          data-ocid="migration.reason.textarea"
        />
      </Field>
      <Button
        className="w-full"
        data-ocid="migration.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function MigrationPreview({ data }: { data: Record<string, string> }) {
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="Migration Certificate" />
      <table
        className="w-full border-collapse text-sm"
        style={{ borderCollapse: "collapse" }}
      >
        <tbody>
          {[
            ["Student Name", data.studentName],
            ["Father's Name", data.fatherName],
            ["Admission No.", data.admissionNo],
            ["Class", data.grade],
            ["Board of Examination", data.board],
            ["Year of Passing", data.yearOfPassing],
            ["Marks Obtained", data.marksObtained],
            ["Subjects Studied", data.subjects],
            ["Reason for Migration", data.reasonForMigration],
            ["Destination State", data.destinationState],
            ["Destination School", data.destinationSchool || "Not specified"],
          ].map(([label, value]) => (
            <tr key={label} className="border border-gray-300">
              <td className="font-medium bg-gray-50 px-3 py-1.5 w-2/5 border border-gray-300">
                {label}
              </td>
              <td className="px-3 py-1.5 border border-gray-300">
                {value || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm">
        <p>Date of Issue: {formatDate(data.issueDate)}</p>
      </div>
      <SignatureRow
        labels={["Class Teacher", "Examination Cell", "Principal"]}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 6 — Fee Receipt
// ═══════════════════════════════════════════════════════════════════
function FeeReceiptForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string | number>) => void }) {
  const [form, setForm] = useState<Record<string, string | number>>({
    studentName: "",
    grade: "",
    rollNumber: "",
    receiptNo: autoReceiptNo(),
    feePeriod: "",
    tuitionFee: "",
    activityFee: "",
    transportFee: "",
    otherFee: "",
    paymentMode: "Cash",
    transactionRef: "",
    date: todayStr(),
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const numVal = (k: string) => Number(form[k]) || 0;
  const total =
    numVal("tuitionFee") +
    numVal("activityFee") +
    numVal("transportFee") +
    numVal("otherFee");
  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({ ...p, studentName: d.studentName, grade: d.grade }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={String(form.studentName)}
            onChange={set("studentName")}
            data-ocid="receipt.student_name.input"
          />
        </Field>
        <Field label="Class / Grade">
          <Input
            value={String(form.grade)}
            onChange={set("grade")}
            data-ocid="receipt.grade.input"
          />
        </Field>
        <Field label="Roll Number">
          <Input
            value={String(form.rollNumber)}
            onChange={set("rollNumber")}
            data-ocid="receipt.roll_no.input"
          />
        </Field>
        <Field label="Receipt Number">
          <Input
            value={String(form.receiptNo)}
            onChange={set("receiptNo")}
            data-ocid="receipt.receipt_no.input"
          />
        </Field>
        <Field label="Fee Period (e.g. April 2025 / Term 1)">
          <Input
            value={String(form.feePeriod)}
            onChange={set("feePeriod")}
            placeholder="April 2025"
            data-ocid="receipt.fee_period.input"
          />
        </Field>
        <Field label="Payment Mode">
          <Select
            value={String(form.paymentMode)}
            onValueChange={(v) => setForm((p) => ({ ...p, paymentMode: v }))}
          >
            <SelectTrigger data-ocid="receipt.payment_mode.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Cash", "Cheque", "Online Transfer", "Demand Draft", "UPI"].map(
                (m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Transaction Reference">
          <Input
            value={String(form.transactionRef)}
            onChange={set("transactionRef")}
            data-ocid="receipt.txn_ref.input"
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={String(form.date)}
            onChange={set("date")}
            data-ocid="receipt.date.input"
          />
        </Field>
      </div>
      <Separator />
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        Fee Components (₹)
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tuition Fee">
          <Input
            type="number"
            value={String(form.tuitionFee)}
            onChange={set("tuitionFee")}
            placeholder="0"
            data-ocid="receipt.tuition_fee.input"
          />
        </Field>
        <Field label="Activity Fee">
          <Input
            type="number"
            value={String(form.activityFee)}
            onChange={set("activityFee")}
            placeholder="0"
            data-ocid="receipt.activity_fee.input"
          />
        </Field>
        <Field label="Transport Fee">
          <Input
            type="number"
            value={String(form.transportFee)}
            onChange={set("transportFee")}
            placeholder="0"
            data-ocid="receipt.transport_fee.input"
          />
        </Field>
        <Field label="Other Fee">
          <Input
            type="number"
            value={String(form.otherFee)}
            onChange={set("otherFee")}
            placeholder="0"
            data-ocid="receipt.other_fee.input"
          />
        </Field>
      </div>
      <div className="bg-primary/5 rounded-lg p-3 flex justify-between items-center">
        <span className="font-semibold text-sm">Total Amount</span>
        <span className="font-bold text-lg text-primary">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>
      <Button
        className="w-full"
        data-ocid="receipt.generate.button"
        onClick={() => onGenerate({ ...form, total })}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function FeeReceiptPreview({
  data,
}: { data: Record<string, string | number> }) {
  const feeRows = [
    ["Tuition Fee", data.tuitionFee],
    ["Activity Fee", data.activityFee],
    ["Transport Fee", data.transportFee],
    ["Other Fee", data.otherFee],
  ].filter(([, v]) => Number(v) > 0);
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="Fee Receipt" />
      <div className="flex justify-between text-sm mb-3">
        <span>
          <strong>Receipt No.:</strong> {data.receiptNo}
        </span>
        <span>
          <strong>Date:</strong> {formatDate(String(data.date))}
        </span>
      </div>
      <table
        className="w-full border-collapse text-sm mb-3"
        style={{ borderCollapse: "collapse" }}
      >
        <tbody>
          {[
            ["Student Name", data.studentName],
            ["Class", data.grade],
            ["Roll No.", data.rollNumber],
            ["Fee Period", data.feePeriod],
            ["Payment Mode", data.paymentMode],
            ["Transaction Ref.", data.transactionRef],
          ].map(([label, value]) => (
            <tr key={String(label)} className="border border-gray-300">
              <td className="font-medium bg-gray-50 px-3 py-1.5 w-2/5 border border-gray-300">
                {label}
              </td>
              <td className="px-3 py-1.5 border border-gray-300">
                {String(value) || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table
        className="w-full border-collapse text-sm"
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">
              Fee Head
            </th>
            <th className="border border-gray-300 px-3 py-2 text-right">
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          {feeRows.map(([label, value]) => (
            <tr key={String(label)}>
              <td className="border border-gray-300 px-3 py-1.5">{label}</td>
              <td className="border border-gray-300 px-3 py-1.5 text-right">
                {Number(value).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="border border-gray-300 px-3 py-2">Total</td>
            <td className="border border-gray-300 px-3 py-2 text-right">
              ₹{Number(data.total).toLocaleString("en-IN")}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-center text-xs text-gray-400 mt-4">
        This is a computer-generated receipt. No signature required.
      </p>
      <SignatureRow labels={["Accountant", "School Seal", "Principal"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 7 — School Leaving Certificate
// ═══════════════════════════════════════════════════════════════════
function LeavingForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    admissionDate: "",
    leavingDate: todayStr(),
    reason: "",
    conduct: "Good",
    remarks: "",
    issueDate: todayStr(),
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({ ...p, studentName: d.studentName, grade: d.grade }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={form.studentName}
            onChange={set("studentName")}
            data-ocid="leaving.student_name.input"
          />
        </Field>
        <Field label="Class / Grade">
          <Input
            value={form.grade}
            onChange={set("grade")}
            data-ocid="leaving.grade.input"
          />
        </Field>
        <Field label="Date of Admission">
          <Input
            type="date"
            value={form.admissionDate}
            onChange={set("admissionDate")}
            data-ocid="leaving.admission_date.input"
          />
        </Field>
        <Field label="Date of Leaving">
          <Input
            type="date"
            value={form.leavingDate}
            onChange={set("leavingDate")}
            data-ocid="leaving.leaving_date.input"
          />
        </Field>
        <Field label="Reason for Leaving">
          <Input
            value={form.reason}
            onChange={set("reason")}
            data-ocid="leaving.reason.input"
          />
        </Field>
        <Field label="Conduct">
          <Select
            value={form.conduct}
            onValueChange={(v) => setForm((p) => ({ ...p, conduct: v }))}
          >
            <SelectTrigger data-ocid="leaving.conduct.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Excellent", "Good", "Satisfactory"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of Issue">
          <Input
            type="date"
            value={form.issueDate}
            onChange={set("issueDate")}
            data-ocid="leaving.issue_date.input"
          />
        </Field>
      </div>
      <Field label="Remarks">
        <Textarea
          value={form.remarks}
          onChange={set("remarks")}
          rows={2}
          data-ocid="leaving.remarks.textarea"
        />
      </Field>
      <Button
        className="w-full"
        data-ocid="leaving.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function LeavingPreview({ data }: { data: Record<string, string> }) {
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="School Leaving Certificate" />
      <p className="leading-relaxed text-justify mb-4">
        This is to certify that{" "}
        <strong>{data.studentName || "______________"}</strong> was a student of
        this school, studying in <strong>Class {data.grade || "______"}</strong>
        . He/She was admitted on{" "}
        <strong>{formatDate(data.admissionDate)}</strong> and left the school on{" "}
        <strong>{formatDate(data.leavingDate)}</strong>.
      </p>
      <table
        className="w-full border-collapse text-sm"
        style={{ borderCollapse: "collapse" }}
      >
        <tbody>
          {[
            ["Reason for Leaving", data.reason],
            ["Character & Conduct", data.conduct],
            ["Remarks", data.remarks],
          ].map(([label, value]) => (
            <tr key={label} className="border border-gray-300">
              <td className="font-medium bg-gray-50 px-3 py-1.5 w-2/5 border border-gray-300">
                {label}
              </td>
              <td className="px-3 py-1.5 border border-gray-300">
                {value || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm">
        <p>Date of Issue: {formatDate(data.issueDate)}</p>
      </div>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 8 — Student ID Card
// ═══════════════════════════════════════════════════════════════════
function IDCardForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    rollNumber: "",
    dob: "",
    bloodGroup: "",
    parentName: "",
    contactNumber: "",
    address: "",
    academicYear: "",
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({
            ...p,
            studentName: d.studentName,
            grade: d.grade,
            dob: d.dob,
            parentName: d.parentName,
            contactNumber: d.contactPhone,
          }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={form.studentName}
            onChange={set("studentName")}
            data-ocid="idcard.student_name.input"
          />
        </Field>
        <Field label="Class / Grade">
          <Input
            value={form.grade}
            onChange={set("grade")}
            data-ocid="idcard.grade.input"
          />
        </Field>
        <Field label="Roll Number">
          <Input
            value={form.rollNumber}
            onChange={set("rollNumber")}
            data-ocid="idcard.roll_no.input"
          />
        </Field>
        <Field label="Date of Birth">
          <Input
            type="date"
            value={form.dob}
            onChange={set("dob")}
            data-ocid="idcard.dob.input"
          />
        </Field>
        <Field label="Blood Group">
          <Input
            value={form.bloodGroup}
            onChange={set("bloodGroup")}
            placeholder="e.g. O+"
            data-ocid="idcard.blood_group.input"
          />
        </Field>
        <Field label="Parent Name">
          <Input
            value={form.parentName}
            onChange={set("parentName")}
            data-ocid="idcard.parent_name.input"
          />
        </Field>
        <Field label="Contact Number">
          <Input
            value={form.contactNumber}
            onChange={set("contactNumber")}
            data-ocid="idcard.contact.input"
          />
        </Field>
        <Field label="Academic Year">
          <Input
            value={form.academicYear}
            placeholder="2025-2026"
            onChange={set("academicYear")}
            data-ocid="idcard.academic_year.input"
          />
        </Field>
      </div>
      <Field label="Address">
        <Textarea
          value={form.address}
          onChange={set("address")}
          rows={2}
          data-ocid="idcard.address.textarea"
        />
      </Field>
      <Button
        className="w-full"
        data-ocid="idcard.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function IDCardPreview({ data }: { data: Record<string, string> }) {
  return (
    <div className="flex justify-center">
      <div
        className="border-2 border-blue-700 rounded-xl overflow-hidden shadow-xl"
        style={{ width: 320, fontFamily: "Arial, sans-serif" }}
      >
        {/* Card Header */}
        <div className="bg-blue-700 text-white px-4 py-3 flex items-center gap-3">
          <img
            src={SCHOOL_LOGO}
            alt="Logo"
            className="w-10 h-10 object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <p className="font-bold text-sm">{SCHOOL_NAME}</p>
            <p className="text-xs opacity-80">STUDENT IDENTITY CARD</p>
          </div>
        </div>
        {/* Card Body */}
        <div className="bg-white px-4 py-3 flex gap-3">
          <div
            className="border-2 border-gray-300 flex-shrink-0"
            style={{
              width: 70,
              height: 85,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="text-gray-300 text-xs text-center">Photo</span>
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="font-bold text-sm text-blue-800">
              {data.studentName || "Student Name"}
            </p>
            <p className="text-xs">
              <span className="text-gray-500">Class:</span> {data.grade}
            </p>
            <p className="text-xs">
              <span className="text-gray-500">Roll No.:</span> {data.rollNumber}
            </p>
            <p className="text-xs">
              <span className="text-gray-500">DOB:</span> {formatDate(data.dob)}
            </p>
            <p className="text-xs">
              <span className="text-gray-500">Blood Grp.:</span>{" "}
              <span className="text-red-600 font-bold">{data.bloodGroup}</span>
            </p>
            <p className="text-xs">
              <span className="text-gray-500">Year:</span> {data.academicYear}
            </p>
          </div>
        </div>
        {/* Card Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
          <p className="text-xs">
            <span className="text-gray-500">Parent:</span> {data.parentName}
          </p>
          <p className="text-xs">
            <span className="text-gray-500">Contact:</span> {data.contactNumber}
          </p>
          <p className="text-xs text-gray-500 truncate">{data.address}</p>
        </div>
        <div className="bg-blue-700 text-white text-center py-1.5">
          <p className="text-xs">
            If found, please return to school. {SCHOOL_PHONE}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 9 — Progress Report
// ═══════════════════════════════════════════════════════════════════
const SUBJECTS = [
  "Language I (English)",
  "Language II (Hindi)",
  "Mathematics",
  "Science",
  "Social Studies",
  "Computer Science",
  "Physical Education",
  "Art & Craft",
];

interface SubjectRow {
  subject: string;
  maxMarks: number;
  marksObtained: string;
}

function ProgressForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string | SubjectRow[]>) => void }) {
  const [info, setInfo] = useState({
    studentName: "",
    grade: "",
    rollNumber: "",
    term: "Term 1",
    academicYear: "",
    totalDays: "",
    presentDays: "",
    teacherRemarks: "",
    principalRemarks: "",
  });
  const [rows, setRows] = useState<SubjectRow[]>(
    SUBJECTS.map((s) => ({ subject: s, maxMarks: 100, marksObtained: "" })),
  );
  const setInfoField =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setInfo((p) => ({ ...p, [k]: e.target.value }));
  const setMark = (i: number, val: string) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, marksObtained: val } : r)),
    );

  const total = rows.reduce((s, r) => s + (Number(r.marksObtained) || 0), 0);
  const maxTotal = rows.reduce((s, r) => s + r.maxMarks, 0);
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const grade = getGradeLetter(pct);

  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setInfo((p) => ({ ...p, studentName: d.studentName, grade: d.grade }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={info.studentName}
            onChange={setInfoField("studentName")}
            data-ocid="progress.student_name.input"
          />
        </Field>
        <Field label="Class / Grade">
          <Input
            value={info.grade}
            onChange={setInfoField("grade")}
            data-ocid="progress.grade.input"
          />
        </Field>
        <Field label="Roll Number">
          <Input
            value={info.rollNumber}
            onChange={setInfoField("rollNumber")}
            data-ocid="progress.roll_no.input"
          />
        </Field>
        <Field label="Term">
          <Select
            value={info.term}
            onValueChange={(v) => setInfo((p) => ({ ...p, term: v }))}
          >
            <SelectTrigger data-ocid="progress.term.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Term 1", "Term 2", "Annual"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Academic Year">
          <Input
            value={info.academicYear}
            placeholder="2024-2025"
            onChange={setInfoField("academicYear")}
            data-ocid="progress.academic_year.input"
          />
        </Field>
        <Field label="Total Days">
          <Input
            value={info.totalDays}
            onChange={setInfoField("totalDays")}
            placeholder="240"
            data-ocid="progress.total_days.input"
          />
        </Field>
        <Field label="Days Present">
          <Input
            value={info.presentDays}
            onChange={setInfoField("presentDays")}
            placeholder="230"
            data-ocid="progress.present_days.input"
          />
        </Field>
      </div>
      <Separator />
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        Marks Entry
      </p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={row.subject} className="flex items-center gap-3">
            <span
              className="text-xs flex-1 min-w-0 truncate"
              title={row.subject}
            >
              {row.subject}
            </span>
            <Input
              type="number"
              className="w-24 text-center"
              placeholder="/ 100"
              value={row.marksObtained}
              onChange={(e) => setMark(i, e.target.value)}
              data-ocid={`progress.marks.input.${i + 1}`}
              min={0}
              max={row.maxMarks}
            />
          </div>
        ))}
      </div>
      <div className="bg-primary/5 rounded-lg p-3 text-sm flex justify-between">
        <span>
          Total:{" "}
          <strong>
            {total}/{maxTotal}
          </strong>
        </span>
        <span>
          Percentage: <strong>{pct.toFixed(1)}%</strong>
        </span>
        <span>
          Grade: <strong className="text-primary">{grade}</strong>
        </span>
      </div>
      <Field label="Class Teacher's Remarks">
        <Textarea
          value={info.teacherRemarks}
          onChange={setInfoField("teacherRemarks")}
          rows={2}
          data-ocid="progress.teacher_remarks.textarea"
        />
      </Field>
      <Field label="Principal's Remarks">
        <Textarea
          value={info.principalRemarks}
          onChange={setInfoField("principalRemarks")}
          rows={2}
          data-ocid="progress.principal_remarks.textarea"
        />
      </Field>
      <Button
        className="w-full"
        data-ocid="progress.generate.button"
        onClick={() =>
          onGenerate({
            ...info,
            rows: JSON.stringify(rows),
            total: String(total),
            maxTotal: String(maxTotal),
            pct: pct.toFixed(1),
            grade,
          })
        }
      >
        Generate Preview
      </Button>
    </div>
  );
}

function ProgressPreview({
  data,
}: { data: Record<string, string | SubjectRow[]> }) {
  let rows: SubjectRow[] = [];
  try {
    rows = JSON.parse(String(data.rows)) as SubjectRow[];
  } catch {
    rows = [];
  }
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title={`Progress Report — ${String(data.term)}`} />
      <div className="flex justify-between text-sm mb-3">
        <span>
          <strong>Student:</strong> {String(data.studentName)}
        </span>
        <span>
          <strong>Class:</strong> {String(data.grade)}
        </span>
        <span>
          <strong>Roll No.:</strong> {String(data.rollNumber)}
        </span>
      </div>
      <div className="flex justify-between text-sm mb-4">
        <span>
          <strong>Academic Year:</strong> {String(data.academicYear)}
        </span>
        <span>
          <strong>Attendance:</strong> {String(data.presentDays)}/
          {String(data.totalDays)} days
        </span>
      </div>
      <table
        className="w-full border-collapse text-sm"
        style={{ borderCollapse: "collapse" }}
      >
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="border border-gray-300 px-3 py-2 text-left">
              Subject
            </th>
            <th className="border border-gray-300 px-3 py-2 text-center">
              Max Marks
            </th>
            <th className="border border-gray-300 px-3 py-2 text-center">
              Marks Obtained
            </th>
            <th className="border border-gray-300 px-3 py-2 text-center">
              Grade
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pct =
              row.maxMarks > 0
                ? (Number(row.marksObtained) / row.maxMarks) * 100
                : 0;
            return (
              <tr key={row.subject}>
                <td className="border border-gray-300 px-3 py-1.5">
                  {row.subject}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-center">
                  {row.maxMarks}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-center">
                  {row.marksObtained || "—"}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-center font-medium">
                  {row.marksObtained ? getGradeLetter(pct) : "—"}
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-100 font-bold">
            <td className="border border-gray-300 px-3 py-2">Total</td>
            <td className="border border-gray-300 px-3 py-2 text-center">
              {String(data.maxTotal)}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center">
              {String(data.total)}
            </td>
            <td className="border border-gray-300 px-3 py-2 text-center text-blue-700">
              {String(data.grade)}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-3 flex justify-between text-sm">
        <span>
          <strong>Percentage:</strong> {String(data.pct)}%
        </span>
        <span>
          <strong>Overall Grade:</strong>{" "}
          <span className="text-blue-700 font-bold">{String(data.grade)}</span>
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="border border-gray-300 p-2 rounded">
          <strong className="text-xs uppercase tracking-wide text-gray-500">
            Class Teacher's Remarks
          </strong>
          <p className="mt-1">{String(data.teacherRemarks) || "—"}</p>
        </div>
        <div className="border border-gray-300 p-2 rounded">
          <strong className="text-xs uppercase tracking-wide text-gray-500">
            Principal's Remarks
          </strong>
          <p className="mt-1">{String(data.principalRemarks) || "—"}</p>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 border border-gray-200 p-2 rounded">
        <strong>Grading Scale:</strong> A1 ≥90% | A2 ≥80% | B1 ≥70% | B2 ≥60% |
        C1 ≥50% | C2 ≥40% | D &lt;40%
      </div>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT 10 — NOC
// ═══════════════════════════════════════════════════════════════════
function NOCForm({
  onGenerate,
}: { onGenerate: (data: Record<string, string>) => void }) {
  const [form, setForm] = useState({
    studentName: "",
    grade: "",
    admissionNumber: "",
    dateOfAdmission: "",
    dateOfNOC: todayStr(),
    reasonForNOC: "",
    destinationInstitution: "",
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({ ...p, studentName: d.studentName, grade: d.grade }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={form.studentName}
            onChange={set("studentName")}
            data-ocid="noc.student_name.input"
          />
        </Field>
        <Field label="Class / Grade">
          <Input
            value={form.grade}
            onChange={set("grade")}
            data-ocid="noc.grade.input"
          />
        </Field>
        <Field label="Admission Number">
          <Input
            value={form.admissionNumber}
            onChange={set("admissionNumber")}
            data-ocid="noc.admission_no.input"
          />
        </Field>
        <Field label="Date of Admission">
          <Input
            type="date"
            value={form.dateOfAdmission}
            onChange={set("dateOfAdmission")}
            data-ocid="noc.admission_date.input"
          />
        </Field>
        <Field label="Date of NOC">
          <Input
            type="date"
            value={form.dateOfNOC}
            onChange={set("dateOfNOC")}
            data-ocid="noc.noc_date.input"
          />
        </Field>
        <Field label="Destination School / Institution">
          <Input
            value={form.destinationInstitution}
            onChange={set("destinationInstitution")}
            data-ocid="noc.destination.input"
          />
        </Field>
      </div>
      <Field label="Reason for NOC">
        <Textarea
          value={form.reasonForNOC}
          onChange={set("reasonForNOC")}
          rows={2}
          data-ocid="noc.reason.textarea"
        />
      </Field>
      <Button
        className="w-full"
        data-ocid="noc.generate.button"
        onClick={() => onGenerate(form)}
      >
        Generate Preview
      </Button>
    </div>
  );
}

function NOCPreview({ data }: { data: Record<string, string> }) {
  return (
    <div className="text-sm text-gray-800">
      <SchoolHeader />
      <DocTitle title="No Objection Certificate" />
      <div className="text-right text-sm mb-4">
        Date: {formatDate(data.dateOfNOC)}
      </div>
      <p className="leading-relaxed text-justify mb-4">
        This is to certify that{" "}
        <strong>{data.studentName || "______________"}</strong>, Admission No.{" "}
        <strong>{data.admissionNumber || "______"}</strong>, studying in{" "}
        <strong>Class {data.grade || "______"}</strong>, has been admitted to
        this institution on <strong>{formatDate(data.dateOfAdmission)}</strong>.
      </p>
      <p className="leading-relaxed text-justify mb-4">
        The school has <strong>No Objection</strong> to his/her leaving this
        institution for the purpose of{" "}
        <strong>{data.reasonForNOC || "seeking admission elsewhere"}</strong>.
        {data.destinationInstitution &&
          ` He/She intends to seek admission at ${data.destinationInstitution}.`}
      </p>
      <p className="leading-relaxed text-justify">
        We wish him/her all the very best in his/her future endeavours.
      </p>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
    </div>
  );
}

// ─── Board-aware TC form wrapper ─────────────────────────────────────────────
function TCFormWithBoard({
  board,
  state,
  onGenerate,
}: {
  board: BoardType;
  state: string;
  onGenerate: (d: Record<string, string>) => void;
}) {
  const [boardExtraForm, setBoardExtraForm] = useState<Record<string, string>>(
    {},
  );

  const wrappedGenerate = (d: Record<string, string>) => {
    onGenerate({ ...d, ...boardExtraForm });
  };

  return (
    <div>
      <TCForm onGenerate={wrappedGenerate} />
      <div className="mt-4">
        <TCBoardExtraFields
          board={board}
          state={state}
          form={boardExtraForm}
          setForm={setBoardExtraForm}
        />
      </div>
    </div>
  );
}

// ─── Board-aware Admission form wrapper ──────────────────────────────────────
function AdmissionFormWithBoard({
  board,
  state,
  onGenerate,
}: {
  board: BoardType;
  state: string;
  onGenerate: (d: Record<string, string | boolean>) => void;
}) {
  const [boardExtraForm, setBoardExtraForm] = useState<
    Record<string, string | boolean>
  >({});

  const wrappedGenerate = (d: Record<string, string | boolean>) => {
    onGenerate({ ...d, ...boardExtraForm });
  };

  return (
    <div>
      <AdmissionForm onGenerate={wrappedGenerate} />
      <div className="mt-4">
        <AdmissionBoardExtraFields
          board={board}
          state={state}
          form={boardExtraForm}
          setForm={setBoardExtraForm}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN DocumentsPage component
// ═══════════════════════════════════════════════════════════════════
type PreviewData = Record<string, string | boolean | number | SubjectRow[]>;

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedBoardDoc, setSelectedBoardDoc] = useState<BoardDocType | null>(
    null,
  );
  const [boardPreviewData, setBoardPreviewData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<BoardType>(
    () => (localStorage.getItem("classio_school_board") as BoardType) || "cbse",
  );
  const [selectedState, setSelectedState] = useState<string>(
    () => localStorage.getItem("classio_school_state") || "Maharashtra",
  );

  const handleBoardChange = (b: BoardType) => {
    setSelectedBoard(b);
    localStorage.setItem("classio_school_board", b);
  };
  const handleStateChange = (s: string) => {
    setSelectedState(s);
    localStorage.setItem("classio_school_state", s);
  };

  const handleGenerate = (data: PreviewData) => {
    setPreviewData(data);
    setTimeout(() => {
      printRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedDocMeta = DOCUMENT_TYPES.find((d) => d.id === selectedDoc);

  if (!selectedDoc && !selectedBoardDoc) {
    return (
      <div className="p-6 max-w-7xl mx-auto" data-ocid="documents.page">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            School Documents
          </h1>
          <p className="text-muted-foreground text-sm">
            Official document templates as per Indian government requirements.
            Select your school board, then choose a document type to fill and
            generate a print-ready copy.
          </p>
        </div>

        <BoardSelector
          selectedBoard={selectedBoard}
          onBoardChange={handleBoardChange}
          selectedState={selectedState}
          onStateChange={handleStateChange}
        />

        {/* Document grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          data-ocid="documents.list"
        >
          {DOCUMENT_TYPES.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <button
                key={doc.id}
                type="button"
                data-ocid={`documents.item.${idx + 1}`}
                onClick={() => {
                  setSelectedDoc(doc.id);
                  setPreviewData(null);
                }}
                className="text-left group"
              >
                <Card className="h-full hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group-hover:bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      {doc.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded border font-medium ${BADGE_COLORS[doc.badge] || ""}`}
                        >
                          {doc.badge}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-sm font-semibold leading-tight mb-1">
                      {doc.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {doc.description}
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Document Category Legend
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(BADGE_COLORS).map(([label, cls]) => (
              <span
                key={label}
                className={`text-xs px-2 py-0.5 rounded border font-medium ${cls}`}
              >
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Documents marked <strong>Mandatory</strong> are required by law as
            per Indian school education regulations. Bonafide/Character
            certificates are frequently requested by students.
          </p>
        </div>

        {/* Board-specific extra documents */}
        {BOARD_DOCUMENT_TYPES.filter((d) => d.board === selectedBoard).length >
          0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-1">
              {selectedBoard === "cbse"
                ? "CBSE Specific Documents"
                : selectedBoard === "icse"
                  ? "ICSE / CISCE Specific Documents"
                  : `${selectedState || "State"} Board Specific Documents`}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Additional forms and certificates required by your board.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {BOARD_DOCUMENT_TYPES.filter(
                (d) => d.board === selectedBoard,
              ).map((doc, idx) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    data-ocid={`documents.board.item.${idx + 1}`}
                    onClick={() => {
                      setSelectedBoardDoc(doc.id);
                      setBoardPreviewData(null);
                    }}
                    className="text-left group"
                  >
                    <Card className="h-full hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group-hover:bg-primary/5">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          {doc.badge && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded border font-medium ${BOARD_BADGE_COLORS[doc.badge] || ""}`}
                            >
                              {doc.badge}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm font-semibold leading-tight mb-1">
                          {doc.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {doc.description}
                        </p>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Board-specific document work area
  if (selectedBoardDoc) {
    const boardDocMeta = BOARD_DOCUMENT_TYPES.find(
      (d) => d.id === selectedBoardDoc,
    );
    return (
      <div
        className="p-6 max-w-7xl mx-auto"
        data-ocid="documents.board.work_area"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBoardDoc(null);
              setBoardPreviewData(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Documents
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {boardDocMeta?.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              Fill the form below, then click &quot;Generate Preview&quot; to
              see the print-ready document.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent
              className="overflow-y-auto"
              style={{ maxHeight: "80vh" }}
            >
              <BoardDocumentForm
                docType={selectedBoardDoc}
                board={selectedBoard}
                state={selectedState}
                onGenerate={(d) => {
                  setBoardPreviewData(d as Record<string, unknown>);
                  setTimeout(() => {
                    printRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              />
            </CardContent>
          </Card>

          <div>
            {boardPreviewData ? (
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Printer className="h-4 w-4 text-primary" />
                    Print Preview
                  </CardTitle>
                  <Button size="sm" onClick={handlePrint}>
                    <Printer className="h-3.5 w-3.5 mr-1.5" />
                    Print
                  </Button>
                </CardHeader>
                <CardContent
                  className="overflow-y-auto"
                  style={{ maxHeight: "80vh" }}
                >
                  <div
                    ref={printRef}
                    id="print-document"
                    className="bg-white p-8 text-black rounded-lg border border-gray-200 shadow-inner"
                    style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: 13,
                      lineHeight: 1.6,
                      minHeight: 600,
                    }}
                  >
                    <BoardDocumentPreview
                      docType={selectedBoardDoc}
                      data={boardPreviewData as Record<string, string>}
                      board={selectedBoard}
                      state={selectedState}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="flex items-center justify-center"
                style={{ minHeight: 300 }}
              >
                <CardContent className="text-center text-muted-foreground py-12">
                  <Printer className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    Fill in the form and click
                    <br />
                    &quot;Generate Preview&quot; to see the document.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-ocid="documents.work_area">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          data-ocid="documents.back.button"
          onClick={() => {
            setSelectedDoc(null);
            setPreviewData(null);
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Documents
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {selectedDocMeta?.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Fill the form below, then click &quot;Generate Preview&quot; to see
            the print-ready document.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT — Form */}
        <Card data-ocid="documents.form.panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Document Details
            </CardTitle>
          </CardHeader>
          <CardContent
            className="overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            {selectedDoc === "tc" && (
              <TCFormWithBoard
                board={selectedBoard}
                state={selectedState}
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "admission" && (
              <AdmissionFormWithBoard
                board={selectedBoard}
                state={selectedState}
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "bonafide" && (
              <BonafideForm
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "character" && (
              <CharacterForm
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "migration" && (
              <MigrationForm
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "fee-receipt" && (
              <FeeReceiptForm
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "leaving" && (
              <LeavingForm
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "id-card" && (
              <IDCardForm
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "progress-report" && (
              <ProgressForm
                onGenerate={(d) => handleGenerate(d as PreviewData)}
              />
            )}
            {selectedDoc === "noc" && (
              <NOCForm onGenerate={(d) => handleGenerate(d as PreviewData)} />
            )}
          </CardContent>
        </Card>

        {/* RIGHT — Preview */}
        <div>
          {previewData ? (
            <Card data-ocid="documents.preview.panel">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Printer className="h-4 w-4 text-primary" />
                  Print Preview
                </CardTitle>
                <Button
                  size="sm"
                  data-ocid="documents.print.button"
                  onClick={handlePrint}
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  Print
                </Button>
              </CardHeader>
              <CardContent
                className="overflow-y-auto"
                style={{ maxHeight: "80vh" }}
              >
                <div
                  ref={printRef}
                  id="print-document"
                  className="bg-white p-8 text-black rounded-lg border border-gray-200 shadow-inner"
                  style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 13,
                    lineHeight: 1.6,
                    minHeight: 600,
                  }}
                >
                  {selectedDoc === "tc" && (
                    <TCPreview data={previewData as Record<string, string>} />
                  )}
                  {selectedDoc === "admission" && (
                    <AdmissionPreview
                      data={previewData as Record<string, string | boolean>}
                    />
                  )}
                  {selectedDoc === "bonafide" && (
                    <BonafidePreview
                      data={previewData as Record<string, string>}
                    />
                  )}
                  {selectedDoc === "character" && (
                    <CharacterPreview
                      data={previewData as Record<string, string>}
                    />
                  )}
                  {selectedDoc === "migration" && (
                    <MigrationPreview
                      data={previewData as Record<string, string>}
                    />
                  )}
                  {selectedDoc === "fee-receipt" && (
                    <FeeReceiptPreview
                      data={previewData as Record<string, string | number>}
                    />
                  )}
                  {selectedDoc === "leaving" && (
                    <LeavingPreview
                      data={previewData as Record<string, string>}
                    />
                  )}
                  {selectedDoc === "id-card" && (
                    <IDCardPreview
                      data={previewData as Record<string, string>}
                    />
                  )}
                  {selectedDoc === "progress-report" && (
                    <ProgressPreview
                      data={
                        previewData as Record<string, string | SubjectRow[]>
                      }
                    />
                  )}
                  {selectedDoc === "noc" && (
                    <NOCPreview data={previewData as Record<string, string>} />
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-border rounded-xl text-muted-foreground"
              data-ocid="documents.preview.empty_state"
            >
              <Printer className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No preview yet</p>
              <p className="text-xs">
                Fill the form and click &quot;Generate Preview&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick-switch to another document */}
      <div className="mt-8">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-3">
          Other Documents
        </p>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_TYPES.filter((d) => d.id !== selectedDoc).map((doc) => {
            const Icon = doc.icon;
            return (
              <button
                key={doc.id}
                type="button"
                data-ocid={`documents.switch.${doc.id}.button`}
                onClick={() => {
                  setSelectedDoc(doc.id);
                  setPreviewData(null);
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-full hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
              >
                <Icon className="h-3 w-3" />
                {doc.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
