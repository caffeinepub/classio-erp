/**
 * Board-specific document additions for Classio ERP
 * Provides CBSE, ICSE, and State Board specific forms, previews, and board selector UI.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAllStudents } from "../hooks/useQueries";

export type BoardType = "cbse" | "icse" | "stateboard";

export type BoardDocType =
  | "cbse-provisional"
  | "cbse-slc"
  | "icse-noc"
  | "icse-internal-assessment"
  | "state-caste-annexure"
  | "state-rte-form";

export interface BoardDocCard {
  id: BoardDocType;
  title: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  board: BoardType;
}

export const BOARD_DOCUMENT_TYPES: BoardDocCard[] = [
  {
    id: "cbse-provisional",
    title: "Provisional Certificate",
    description:
      "Issued when original documents are unavailable. Certifies Class 10/12 pass from CBSE affiliated school.",
    icon: Award,
    badge: "CBSE",
    board: "cbse",
  },
  {
    id: "cbse-slc",
    title: "SLC – CBSE Format",
    description:
      "School Leaving Certificate as per CBSE Bye-Laws with all mandatory fields including NCC, Scout, and conduct.",
    icon: FileText,
    badge: "CBSE",
    board: "cbse",
  },
  {
    id: "icse-noc",
    title: "CISCE NOC",
    description:
      "No Objection Certificate in CISCE format with school code and student CISCE registration number.",
    icon: Shield,
    badge: "ICSE",
    board: "icse",
  },
  {
    id: "icse-internal-assessment",
    title: "Internal Assessment Sheet",
    description:
      "Subject-wise internal assessment and project marks for ICSE Class 9–10 students.",
    icon: ClipboardList,
    badge: "ICSE",
    board: "icse",
  },
  {
    id: "state-caste-annexure",
    title: "Caste Certificate Annexure",
    description:
      "Annexure for SC/ST/OBC students attached with admission form as per state government policy.",
    icon: Users,
    badge: "State",
    board: "stateboard",
  },
  {
    id: "state-rte-form",
    title: "RTE Admission Form",
    description:
      "Right to Education Act Section 12(1)(c) admission form for EWS/disadvantaged group students.",
    icon: BookOpen,
    badge: "State",
    board: "stateboard",
  },
];

export const BOARD_BADGE_COLORS: Record<string, string> = {
  CBSE: "bg-blue-50 text-blue-700 border-blue-200",
  ICSE: "bg-purple-50 text-purple-700 border-purple-200",
  State: "bg-amber-50 text-amber-700 border-amber-200",
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other",
];

// ── Board Selector ────────────────────────────────────────────────────────────
export function BoardSelector({
  selectedBoard,
  onBoardChange,
  selectedState,
  onStateChange,
}: {
  selectedBoard: BoardType;
  onBoardChange: (b: BoardType) => void;
  selectedState: string;
  onStateChange: (s: string) => void;
}) {
  const boards: {
    id: BoardType;
    label: string;
    short: string;
    color: string;
  }[] = [
    {
      id: "cbse",
      label: "CBSE",
      short: "Central Board of Secondary Education",
      color:
        selectedBoard === "cbse"
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50",
    },
    {
      id: "icse",
      label: "ICSE",
      short: "CISCE – Council for Indian School Certificate",
      color:
        selectedBoard === "icse"
          ? "bg-purple-600 text-white border-purple-600"
          : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50",
    },
    {
      id: "stateboard",
      label: "State Board",
      short: "State Government Board of Education",
      color:
        selectedBoard === "stateboard"
          ? "bg-amber-600 text-white border-amber-600"
          : "bg-white text-amber-700 border-amber-300 hover:bg-amber-50",
    },
  ];

  return (
    <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        School Board
      </p>
      <div className="flex flex-wrap gap-3">
        {boards.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onBoardChange(b.id)}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-150 ${
              b.color
            }`}
          >
            {b.label}
            <span
              className={`block text-xs font-normal mt-0.5 ${
                selectedBoard === b.id ? "opacity-80" : "opacity-60"
              }`}
            >
              {b.short}
            </span>
          </button>
        ))}
      </div>
      {selectedBoard === "stateboard" && (
        <div className="mt-3 max-w-xs">
          <Label className="text-xs">Select State</Label>
          <Select value={selectedState} onValueChange={onStateChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select state..." />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function SchoolPrintHeader({
  board,
  state,
}: { board: BoardType; state: string }) {
  const schoolName =
    localStorage.getItem("classio_school_name") || "ABC Public School";
  const schoolLogo =
    localStorage.getItem("classio_school_logo") ||
    "/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg";
  const schoolAddress =
    localStorage.getItem("classio_school_address") ||
    "123, School Road, City - 400001, India";
  const affiliation = localStorage.getItem("classio_school_affiliation") || "";
  const udise = localStorage.getItem("classio_school_udise") || "";

  const boardLabel =
    board === "cbse"
      ? "CBSE"
      : board === "icse"
        ? "ICSE (CISCE)"
        : `${state || "State"} State Board`;

  return (
    <div className="flex items-start gap-4 pb-4 border-b-2 border-gray-800 mb-5">
      <img
        src={schoolLogo}
        alt="School Logo"
        className="w-16 h-16 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
          {schoolName}
        </h1>
        <p className="text-sm text-gray-600">{schoolAddress}</p>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Board: {boardLabel}
          {affiliation ? ` | Affil. No: ${affiliation}` : ""}
          {udise && board === "stateboard" ? ` | UDISE: ${udise}` : ""}
        </p>
      </div>
    </div>
  );
}

function SignatureRow({ labels }: { labels: string[] }) {
  return (
    <div className="flex justify-between mt-12 pt-4 border-t border-gray-300">
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
      grade: String(s.grade ?? ""),
      dob: dobStr,
      parentName: String(s.parentName ?? ""),
      contactPhone: String(s.contactPhone ?? ""),
    });
  };

  return (
    <Field label="Select Student (Auto-fill)">
      <Select value={selectedId} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={isLoading ? "Loading..." : "Choose a student"}
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

// ════════════════════════════════════════════════════════════════════
// CBSE – Provisional Certificate
// ════════════════════════════════════════════════════════════════════
function CBSEProvisionalForm({
  onGenerate,
}: { onGenerate: (d: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>({
    studentName: "",
    rollNo: "",
    examClass: "10",
    examYear: String(new Date().getFullYear()),
    marksGrade: "",
    affiliationNo: localStorage.getItem("classio_school_affiliation") || "",
    reason: "",
    date: todayStr(),
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) => setForm((p) => ({ ...p, studentName: d.studentName }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input value={form.studentName} onChange={set("studentName")} />
        </Field>
        <Field label="CBSE Roll Number">
          <Input value={form.rollNo} onChange={set("rollNo")} />
        </Field>
        <Field label="Board Exam Class">
          <Select
            value={form.examClass}
            onValueChange={(v) => setForm((p) => ({ ...p, examClass: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Class 10 (CBSE)</SelectItem>
              <SelectItem value="12">Class 12 (CBSE)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Year of Exam">
          <Input value={form.examYear} onChange={set("examYear")} />
        </Field>
        <Field label="Marks / Grade Obtained">
          <Input
            value={form.marksGrade}
            onChange={set("marksGrade")}
            placeholder="e.g. 78% / Grade B1"
          />
        </Field>
        <Field label="CBSE Affiliation Number">
          <Input value={form.affiliationNo} onChange={set("affiliationNo")} />
        </Field>
      </div>
      <Field label="Reason for Provisional Certificate">
        <Textarea
          value={form.reason}
          onChange={set("reason")}
          rows={2}
          placeholder="Original documents not available / Under verification"
        />
      </Field>
      <Field label="Date of Issue">
        <Input type="date" value={form.date} onChange={set("date")} />
      </Field>
      <Button className="w-full" onClick={() => onGenerate(form)}>
        Generate Preview
      </Button>
    </div>
  );
}

function CBSEProvisionalPreview({
  data,
  board,
  state,
}: { data: Record<string, string>; board: BoardType; state: string }) {
  const schoolName =
    localStorage.getItem("classio_school_name") || "ABC Public School";
  return (
    <div className="text-sm text-gray-800">
      <SchoolPrintHeader board={board} state={state} />
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold uppercase tracking-widest underline underline-offset-4">
          Provisional Certificate
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          (Issued under CBSE Affiliation No: {data.affiliationNo})
        </p>
      </div>
      <p className="mb-4 leading-relaxed">
        This is to certify that{" "}
        <strong>{data.studentName || "____________________"}</strong> (CBSE Roll
        No: {data.rollNo || "__________"}) has appeared and passed the Class{" "}
        {data.examClass} Board Examination conducted by the Central Board of
        Secondary Education (CBSE) in the year <strong>{data.examYear}</strong>{" "}
        from <strong>{schoolName}</strong>, obtaining Marks/Grade:{" "}
        <strong>{data.marksGrade || "____________"}</strong>.
      </p>
      <p className="mb-4 leading-relaxed">
        This provisional certificate is being issued as the original
        documents/mark sheet are currently{" "}
        {data.reason || "under verification / not available at present"}.
      </p>
      <p className="mb-4 leading-relaxed">
        This certificate is valid only until the original documents are produced
        and is not a substitute for the original CBSE Mark Sheet/Certificate.
      </p>
      <div className="flex justify-between mt-4 text-sm">
        <span>Date: {formatDate(data.date)}</span>
        <span>Place: School Office</span>
      </div>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
      <p className="text-center text-xs text-gray-400 mt-4">
        This is a computer-generated provisional certificate. Valid with school
        seal.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// CBSE – SLC (Full CBSE Bye-Law Format)
// ════════════════════════════════════════════════════════════════════
function CBSESLCForm({
  onGenerate,
}: { onGenerate: (d: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>({
    slcSerial: `SLC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    admissionNo: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    nationality: "Indian",
    scst: "No",
    firstAdmissionDate: "",
    dob: "",
    dobInWords: "",
    classSince: "",
    boardExam: "CBSE",
    boardExamYear: "",
    failed: "No",
    failedClass: "",
    subjects: "",
    ncc: "No",
    scout: "No",
    games: "",
    conduct: "Good",
    dateOfLeaving: todayStr(),
    classAtLeaving: "",
    reasonForLeaving: "",
    feesDue: "No",
    workingDays: "",
    daysAttended: "",
    progress: "Good",
    eligibleReadmission: "Yes",
    remarks: "",
    date: todayStr(),
  });
  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  const sel = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const yesNoOptions = [
    { v: "Yes", l: "Yes" },
    { v: "No", l: "No" },
  ];

  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({
            ...p,
            studentName: d.studentName,
            dob: d.dob,
            classAtLeaving: d.grade,
            classSince: d.grade,
          }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="SLC Serial Number">
          <Input value={form.slcSerial} onChange={set("slcSerial")} />
        </Field>
        <Field label="Admission Number">
          <Input value={form.admissionNo} onChange={set("admissionNo")} />
        </Field>
        <Field label="Student Name (as per register)">
          <Input value={form.studentName} onChange={set("studentName")} />
        </Field>
        <Field label="Father's / Guardian's Name">
          <Input value={form.fatherName} onChange={set("fatherName")} />
        </Field>
        <Field label="Mother's Name">
          <Input value={form.motherName} onChange={set("motherName")} />
        </Field>
        <Field label="Nationality">
          <Input value={form.nationality} onChange={set("nationality")} />
        </Field>
        <Field label="SC/ST Category">
          <Select value={form.scst} onValueChange={sel("scst")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of First Admission">
          <Input
            type="date"
            value={form.firstAdmissionDate}
            onChange={set("firstAdmissionDate")}
          />
        </Field>
        <Field label="Date of Birth (figures)">
          <Input type="date" value={form.dob} onChange={set("dob")} />
        </Field>
        <Field label="DOB in Words">
          <Input
            value={form.dobInWords}
            onChange={set("dobInWords")}
            placeholder="e.g. Fifteenth March Two Thousand Ten"
          />
        </Field>
        <Field label="Class in which studying & since when">
          <Input
            value={form.classSince}
            onChange={set("classSince")}
            placeholder="e.g. Class 9 since April 2023"
          />
        </Field>
        <Field label="Board Exam Last Appeared">
          <Select value={form.boardExam} onValueChange={sel("boardExam")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CBSE">CBSE</SelectItem>
              <SelectItem value="CBSE Class 10">CBSE Class 10</SelectItem>
              <SelectItem value="CBSE Class 12">CBSE Class 12</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Board Exam Year">
          <Input
            value={form.boardExamYear}
            onChange={set("boardExamYear")}
            placeholder="e.g. 2023"
          />
        </Field>
        <Field label="Whether Failed">
          <Select value={form.failed} onValueChange={sel("failed")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {form.failed === "Yes" && (
          <Field label="Class in which Failed">
            <Input value={form.failedClass} onChange={set("failedClass")} />
          </Field>
        )}
      </div>
      <Field label="Subjects Studied">
        <Input
          value={form.subjects}
          onChange={set("subjects")}
          placeholder="English, Hindi, Maths, Science, Social Science, Computer"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="NCC Cadet">
          <Select value={form.ncc} onValueChange={sel("ncc")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Boy Scout / Girl Guide">
          <Select value={form.scout} onValueChange={sel("scout")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="General Conduct">
          <Select value={form.conduct} onValueChange={sel("conduct")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Exemplary", "Good", "Satisfactory", "Unsatisfactory"].map(
                (v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Progress">
          <Select value={form.progress} onValueChange={sel("progress")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Excellent", "Good", "Satisfactory"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of Leaving">
          <Input
            type="date"
            value={form.dateOfLeaving}
            onChange={set("dateOfLeaving")}
          />
        </Field>
        <Field label="Class at Time of Leaving">
          <Input value={form.classAtLeaving} onChange={set("classAtLeaving")} />
        </Field>
        <Field label="Reason for Leaving">
          <Input
            value={form.reasonForLeaving}
            onChange={set("reasonForLeaving")}
          />
        </Field>
        <Field label="Any Fee Dues">
          <Select value={form.feesDue} onValueChange={sel("feesDue")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Total Working Days">
          <Input value={form.workingDays} onChange={set("workingDays")} />
        </Field>
        <Field label="Days Attended">
          <Input value={form.daysAttended} onChange={set("daysAttended")} />
        </Field>
        <Field label="Eligible for Re-Admission">
          <Select
            value={form.eligibleReadmission}
            onValueChange={sel("eligibleReadmission")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((o) => (
                <SelectItem key={o.v} value={o.v}>
                  {o.l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of Issue">
          <Input type="date" value={form.date} onChange={set("date")} />
        </Field>
      </div>
      <Field label="Games / Extra-Curricular Activities">
        <Input
          value={form.games}
          onChange={set("games")}
          placeholder="Cricket, Football, Drawing"
        />
      </Field>
      <Field label="Remarks">
        <Textarea value={form.remarks} onChange={set("remarks")} rows={2} />
      </Field>
      <Button className="w-full" onClick={() => onGenerate(form)}>
        Generate Preview
      </Button>
    </div>
  );
}

function CBSESLCPreview({
  data,
  board,
  state,
}: { data: Record<string, string>; board: BoardType; state: string }) {
  const rows: [string, string][] = [
    ["1. SLC Serial No.", data.slcSerial],
    ["2. Admission No.", data.admissionNo],
    ["3. Name of Student", data.studentName],
    ["4. Father's / Guardian's Name", data.fatherName],
    ["5. Mother's Name", data.motherName],
    ["6. Nationality", data.nationality],
    ["7. Whether SC/ST", data.scst],
    ["8. Date of First Admission", formatDate(data.firstAdmissionDate)],
    ["9. Date of Birth (Figures)", formatDate(data.dob)],
    ["9a. Date of Birth (Words)", data.dobInWords],
    ["10. Class Studying & Since When", data.classSince],
    [
      "11. Board Exam Last Appeared",
      `${data.boardExam} ${data.boardExamYear}`.trim(),
    ],
    [
      "12. Whether Failed",
      data.failed === "Yes" ? `Yes (Class: ${data.failedClass})` : "No",
    ],
    ["13. Subjects Studied", data.subjects],
    ["14. NCC Cadet", data.ncc],
    ["15. Boy Scout / Girl Guide", data.scout],
    ["16. Games / Extra-Curricular", data.games],
    ["17. General Conduct", data.conduct],
    ["18. Date of Leaving School", formatDate(data.dateOfLeaving)],
    ["19. Class at Time of Leaving", data.classAtLeaving],
    ["20. Reason for Leaving", data.reasonForLeaving],
    ["21. Any Fee Dues", data.feesDue],
    [
      "22. Total Working Days / Days Attended",
      `${data.workingDays || "__"} / ${data.daysAttended || "__"}`,
    ],
    ["23. Progress", data.progress],
    ["24. Eligible for Re-Admission", data.eligibleReadmission],
    ["25. Remarks", data.remarks],
  ];

  return (
    <div className="text-sm text-gray-800">
      <SchoolPrintHeader board={board} state={state} />
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold uppercase tracking-widest underline underline-offset-4">
          School Leaving Certificate
        </h2>
        <p className="text-xs text-gray-500 mt-1">As per CBSE Bye-Laws</p>
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border border-gray-300">
              <td className="font-medium bg-gray-50 px-3 py-1.5 w-2/5 border border-gray-300 text-xs">
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
        <span>Date: {formatDate(data.date)}</span>
      </div>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
      <p className="text-center text-xs text-gray-400 mt-4">
        Certified that the above information is correct as per school records.
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ICSE – CISCE NOC
// ════════════════════════════════════════════════════════════════════
function ICSENOCForm({
  onGenerate,
}: { onGenerate: (d: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>({
    studentName: "",
    cisceRegistration: "",
    indexNo: "",
    class: "",
    year: String(new Date().getFullYear()),
    destinationSchool: "",
    reason: "",
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
            class: d.grade,
          }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input value={form.studentName} onChange={set("studentName")} />
        </Field>
        <Field label="CISCE Registration Number">
          <Input
            value={form.cisceRegistration}
            onChange={set("cisceRegistration")}
          />
        </Field>
        <Field label="Index Number">
          <Input value={form.indexNo} onChange={set("indexNo")} />
        </Field>
        <Field label="Class">
          <Input value={form.class} onChange={set("class")} />
        </Field>
        <Field label="Year">
          <Input value={form.year} onChange={set("year")} />
        </Field>
        <Field label="Date of Issue">
          <Input type="date" value={form.date} onChange={set("date")} />
        </Field>
      </div>
      <Field label="Destination School / Institution">
        <Input
          value={form.destinationSchool}
          onChange={set("destinationSchool")}
        />
      </Field>
      <Field label="Reason for NOC">
        <Textarea value={form.reason} onChange={set("reason")} rows={2} />
      </Field>
      <Button className="w-full" onClick={() => onGenerate(form)}>
        Generate Preview
      </Button>
    </div>
  );
}

function ICSENOCPreview({
  data,
  board,
  state,
}: { data: Record<string, string>; board: BoardType; state: string }) {
  const schoolName =
    localStorage.getItem("classio_school_name") || "ABC Public School";
  const cisceCode =
    localStorage.getItem("classio_school_affiliation") || "CISCE School Code";
  return (
    <div className="text-sm text-gray-800">
      <SchoolPrintHeader board={board} state={state} />
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold uppercase tracking-widest underline underline-offset-4">
          No Objection Certificate
        </h2>
        <p className="text-xs text-gray-500 mt-1">(CISCE Format)</p>
      </div>
      <p className="mb-4 leading-relaxed">
        This is to certify that{" "}
        <strong>{data.studentName || "____________________"}</strong>, CISCE
        Registration No:{" "}
        <strong>{data.cisceRegistration || "__________"}</strong> (Index No:
        {data.indexNo || "__________"}) studying in Class{" "}
        <strong>{data.class || "___"}</strong> at <strong>{schoolName}</strong>{" "}
        (CISCE School Code: {cisceCode}) for the academic year{" "}
        <strong>{data.year}</strong>.
      </p>
      <p className="mb-4 leading-relaxed">
        The school has <strong>no objection</strong> to the student seeking
        admission / participation at{" "}
        <strong>
          {data.destinationSchool || "___________________________"}
        </strong>
        .
      </p>
      {data.reason && (
        <p className="mb-4">
          <strong>Reason:</strong> {data.reason}
        </p>
      )}
      <p className="mb-4 leading-relaxed">
        This NOC is issued on the request of the student / parent and does not
        constitute a withdrawal from this school.
      </p>
      <div className="flex justify-between mt-4 text-sm">
        <span>Date: {formatDate(data.date)}</span>
      </div>
      <SignatureRow labels={["Class Teacher", "School Seal", "Principal"]} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ICSE – Internal Assessment Sheet
// ════════════════════════════════════════════════════════════════════
const IA_SUBJECTS = [
  "English Language",
  "English Literature",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History & Civics",
  "Geography",
  "Computer Applications",
  "Art",
];

type IARow = {
  subject: string;
  pa1: string;
  pa2: string;
  halfYearly: string;
  project: string;
};

function ICSEInternalAssessmentForm({
  onGenerate,
}: { onGenerate: (d: Record<string, string | IARow[]>) => void }) {
  const [meta, setMeta] = useState({
    studentName: "",
    class: "",
    rollNo: "",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    date: todayStr(),
  });
  const [rows, setRows] = useState<IARow[]>(
    IA_SUBJECTS.map((s) => ({
      subject: s,
      pa1: "",
      pa2: "",
      halfYearly: "",
      project: "",
    })),
  );

  const updateRow = (idx: number, field: keyof IARow, value: string) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  };

  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setMeta((p) => ({
            ...p,
            studentName: d.studentName,
            class: d.grade,
          }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input
            value={meta.studentName}
            onChange={(e) =>
              setMeta((p) => ({ ...p, studentName: e.target.value }))
            }
          />
        </Field>
        <Field label="Class">
          <Input
            value={meta.class}
            onChange={(e) => setMeta((p) => ({ ...p, class: e.target.value }))}
          />
        </Field>
        <Field label="Roll Number">
          <Input
            value={meta.rollNo}
            onChange={(e) => setMeta((p) => ({ ...p, rollNo: e.target.value }))}
          />
        </Field>
        <Field label="Academic Year">
          <Input
            value={meta.academicYear}
            onChange={(e) =>
              setMeta((p) => ({ ...p, academicYear: e.target.value }))
            }
          />
        </Field>
      </div>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1.5 text-left">Subject</th>
              <th className="px-2 py-1.5">PA-1 (/20)</th>
              <th className="px-2 py-1.5">PA-2 (/20)</th>
              <th className="px-2 py-1.5">Half Yearly (/80)</th>
              <th className="px-2 py-1.5">Project (/20)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.subject} className="border-t border-border">
                <td className="px-2 py-1 font-medium">{row.subject}</td>
                {(["pa1", "pa2", "halfYearly", "project"] as const).map((f) => (
                  <td key={f} className="px-1 py-0.5">
                    <Input
                      className="h-7 text-xs text-center"
                      value={row[f]}
                      onChange={(e) => updateRow(idx, f, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        className="w-full"
        onClick={() =>
          onGenerate({ ...meta, rows: rows as unknown as IARow[] })
        }
      >
        Generate Preview
      </Button>
    </div>
  );
}

function ICSEInternalAssessmentPreview({
  data,
  board,
  state,
}: {
  data: Record<string, string | IARow[]>;
  board: BoardType;
  state: string;
}) {
  const rows = (data.rows as IARow[]) || [];
  return (
    <div className="text-sm text-gray-800">
      <SchoolPrintHeader board={board} state={state} />
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold uppercase tracking-widest underline underline-offset-4">
          Internal Assessment Sheet
        </h2>
        <p className="text-xs text-gray-500 mt-1">ICSE Class 9-10</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <span>
          <strong>Name:</strong> {String(data.studentName || "—")}
        </span>
        <span>
          <strong>Class:</strong> {String(data.class || "—")}
        </span>
        <span>
          <strong>Roll No:</strong> {String(data.rollNo || "—")}
        </span>
        <span>
          <strong>Academic Year:</strong> {String(data.academicYear || "—")}
        </span>
      </div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">
              Subject
            </th>
            <th className="border border-gray-300 px-2 py-1">PA-1 (/20)</th>
            <th className="border border-gray-300 px-2 py-1">PA-2 (/20)</th>
            <th className="border border-gray-300 px-2 py-1">
              Half Yearly (/80)
            </th>
            <th className="border border-gray-300 px-2 py-1">Project (/20)</th>
            <th className="border border-gray-300 px-2 py-1">Total IA (/20)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pa = (Number(row.pa1) + Number(row.pa2)) / 2;
            const totalIA = Number.isNaN(pa + Number(row.project))
              ? ""
              : String(Math.round((pa + Number(row.project)) / 2));
            return (
              <tr key={row.subject}>
                <td className="border border-gray-300 px-2 py-1">
                  {row.subject}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.pa1 || "—"}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.pa2 || "—"}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.halfYearly || "—"}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  {row.project || "—"}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center font-medium">
                  {totalIA || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <SignatureRow labels={["Subject Teacher", "School Seal", "Principal"]} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// State Board – Caste Certificate Annexure
// ════════════════════════════════════════════════════════════════════
function StateCasteAnnexureForm({
  onGenerate,
}: { onGenerate: (d: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>({
    studentName: "",
    fatherName: "",
    caste: "",
    subCaste: "",
    category: "SC",
    district: "",
    taluka: "",
    certNo: "",
    issuingAuthority: "",
    issueDate: todayStr(),
    date: todayStr(),
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <StudentSelector
        onSelect={(d) =>
          setForm((p) => ({
            ...p,
            studentName: d.studentName,
            fatherName: d.parentName,
          }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input value={form.studentName} onChange={set("studentName")} />
        </Field>
        <Field label="Father's Name">
          <Input value={form.fatherName} onChange={set("fatherName")} />
        </Field>
        <Field label="Caste">
          <Input value={form.caste} onChange={set("caste")} />
        </Field>
        <Field label="Sub-Caste">
          <Input value={form.subCaste} onChange={set("subCaste")} />
        </Field>
        <Field label="Category">
          <Select
            value={form.category}
            onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["SC", "ST", "OBC", "NT (Nomadic Tribe)", "General"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="District">
          <Input value={form.district} onChange={set("district")} />
        </Field>
        <Field label="Taluka / Block">
          <Input value={form.taluka} onChange={set("taluka")} />
        </Field>
        <Field label="Caste Certificate Number">
          <Input value={form.certNo} onChange={set("certNo")} />
        </Field>
        <Field label="Issuing Authority">
          <Input
            value={form.issuingAuthority}
            onChange={set("issuingAuthority")}
          />
        </Field>
        <Field label="Certificate Issue Date">
          <Input
            type="date"
            value={form.issueDate}
            onChange={set("issueDate")}
          />
        </Field>
        <Field label="Date of Annexure">
          <Input type="date" value={form.date} onChange={set("date")} />
        </Field>
      </div>
      <Button className="w-full" onClick={() => onGenerate(form)}>
        Generate Preview
      </Button>
    </div>
  );
}

function StateCasteAnnexurePreview({
  data,
  board,
  state,
}: { data: Record<string, string>; board: BoardType; state: string }) {
  const schoolName =
    localStorage.getItem("classio_school_name") || "ABC Public School";
  return (
    <div className="text-sm text-gray-800">
      <SchoolPrintHeader board={board} state={state} />
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold uppercase tracking-widest underline underline-offset-4">
          Caste Certificate Annexure
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          ({state || "State"} State Board – Admission Annexure)
        </p>
      </div>
      <p className="mb-3 leading-relaxed">
        This is to certify that{" "}
        <strong>{data.studentName || "_____________"}</strong>, Son/Daughter of{" "}
        <strong>{data.fatherName || "_____________"}</strong>, belongs to{" "}
        <strong>{data.caste || "_____________"}</strong>
        {data.subCaste ? ` (Sub-Caste: ${data.subCaste})` : ""} caste, which is
        listed under <strong>{data.category}</strong> category as per the
        Government of {state || "State"} records.
      </p>
      <table className="w-full border-collapse text-sm mb-4">
        <tbody>
          {[
            ["District", data.district],
            ["Taluka / Block", data.taluka],
            ["Caste Certificate No.", data.certNo],
            ["Issuing Authority", data.issuingAuthority],
            ["Certificate Issue Date", formatDate(data.issueDate)],
            ["School Name", schoolName],
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
      <p className="text-xs text-gray-500 mb-4">
        I hereby declare that the above information is correct and the attached
        caste certificate is genuine.
      </p>
      <div className="flex justify-between mt-2 text-sm">
        <span>Date: {formatDate(data.date)}</span>
      </div>
      <div className="flex justify-between mt-8">
        <div className="text-center">
          <div className="border-t border-gray-600 pt-1 w-32 text-xs text-gray-600">
            Parent / Guardian Signature
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-600 pt-1 w-32 text-xs text-gray-600">
            School Seal
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-600 pt-1 w-32 text-xs text-gray-600">
            Principal
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// State Board – RTE Admission Form
// ════════════════════════════════════════════════════════════════════
function StateRTEForm({
  onGenerate,
}: { onGenerate: (d: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>({
    studentName: "",
    dob: "",
    age: "",
    guardianName: "",
    guardianRelation: "Father",
    ewsCategory: "EWS",
    aadhaar: "",
    incomeCertNo: "",
    schoolDistance: "",
    proofOfResidence: "",
    address: "",
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
            guardianName: d.parentName,
          }))
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Student Name">
          <Input value={form.studentName} onChange={set("studentName")} />
        </Field>
        <Field label="Date of Birth">
          <Input type="date" value={form.dob} onChange={set("dob")} />
        </Field>
        <Field label="Age (as on 1 April)">
          <Input
            value={form.age}
            onChange={set("age")}
            placeholder="e.g. 6 years 2 months"
          />
        </Field>
        <Field label="Father / Guardian Name">
          <Input value={form.guardianName} onChange={set("guardianName")} />
        </Field>
        <Field label="Relation">
          <Select
            value={form.guardianRelation}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, guardianRelation: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Father", "Mother", "Guardian"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="EWS / DG Category">
          <Select
            value={form.ewsCategory}
            onValueChange={(v) => setForm((p) => ({ ...p, ewsCategory: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "EWS (Economically Weaker Section)",
                "DG – SC",
                "DG – ST",
                "DG – OBC",
                "DG – Orphan",
                "DG – HIV Affected",
              ].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Aadhaar Number">
          <Input
            value={form.aadhaar}
            onChange={set("aadhaar")}
            placeholder="12-digit Aadhaar"
          />
        </Field>
        <Field label="Income Certificate Number">
          <Input value={form.incomeCertNo} onChange={set("incomeCertNo")} />
        </Field>
        <Field label="Distance of Nearest Govt. School (km)">
          <Input
            value={form.schoolDistance}
            onChange={set("schoolDistance")}
            placeholder="e.g. 2.5 km"
          />
        </Field>
        <Field label="Proof of Residence">
          <Input
            value={form.proofOfResidence}
            onChange={set("proofOfResidence")}
            placeholder="Ration Card / Electricity Bill / etc."
          />
        </Field>
      </div>
      <Field label="Residential Address">
        <Textarea
          value={form.address}
          onChange={set("address")}
          rows={2}
          placeholder="House No, Street, Village/City, Taluka, District, State, PIN"
        />
      </Field>
      <Field label="Date">
        <Input type="date" value={form.date} onChange={set("date")} />
      </Field>
      <Button className="w-full" onClick={() => onGenerate(form)}>
        Generate Preview
      </Button>
    </div>
  );
}

function StateRTEPreview({
  data,
  board,
  state,
}: { data: Record<string, string>; board: BoardType; state: string }) {
  const schoolName =
    localStorage.getItem("classio_school_name") || "ABC Public School";
  return (
    <div className="text-sm text-gray-800">
      <SchoolPrintHeader board={board} state={state} />
      <div className="text-center mb-5">
        <h2 className="text-lg font-bold uppercase tracking-widest underline underline-offset-4">
          Application Form for RTE Admission
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Right to Education Act, 2009 – Section 12(1)(c)
        </p>
      </div>
      <table className="w-full border-collapse text-sm mb-4">
        <tbody>
          {[
            ["Name of Student", data.studentName],
            ["Date of Birth", formatDate(data.dob)],
            ["Age (as on 1 April)", data.age],
            [
              "Father / Guardian Name",
              `${data.guardianName} (${data.guardianRelation})`,
            ],
            ["Category", data.ewsCategory],
            ["Aadhaar Number", data.aadhaar],
            ["Income Certificate No.", data.incomeCertNo],
            [
              "Distance of Nearest Govt. School",
              data.schoolDistance ? `${data.schoolDistance} km` : "—",
            ],
            ["Proof of Residence", data.proofOfResidence],
            ["Residential Address", data.address],
            ["School Applied", schoolName],
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
      <p className="text-xs text-gray-600 mb-4">
        I/We hereby declare that the above information is true and correct. I/We
        understand that if any information is found to be incorrect, the
        admission may be cancelled.
      </p>
      <div className="flex justify-between mt-6">
        <div className="text-center">
          <div className="border-t border-gray-600 pt-1 w-32 text-xs text-gray-600">
            Parent / Guardian Signature
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-600 pt-1 w-32 text-xs text-gray-600">
            Date: {formatDate(data.date)}
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-600 pt-1 w-32 text-xs text-gray-600">
            School Receiving Seal
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN – Board Document Renderer
// ════════════════════════════════════════════════════════════════════
type BoardPreviewData = Record<string, string | IARow[]>;

export function BoardDocumentForm({
  docType,
  board: _board,
  state: _state,
  onGenerate,
}: {
  docType: BoardDocType;
  board: BoardType;
  state: string;
  onGenerate: (d: BoardPreviewData) => void;
}) {
  switch (docType) {
    case "cbse-provisional":
      return (
        <CBSEProvisionalForm
          onGenerate={onGenerate as (d: Record<string, string>) => void}
        />
      );
    case "cbse-slc":
      return (
        <CBSESLCForm
          onGenerate={onGenerate as (d: Record<string, string>) => void}
        />
      );
    case "icse-noc":
      return (
        <ICSENOCForm
          onGenerate={onGenerate as (d: Record<string, string>) => void}
        />
      );
    case "icse-internal-assessment":
      return (
        <ICSEInternalAssessmentForm
          onGenerate={
            onGenerate as (d: Record<string, string | IARow[]>) => void
          }
        />
      );
    case "state-caste-annexure":
      return (
        <StateCasteAnnexureForm
          onGenerate={onGenerate as (d: Record<string, string>) => void}
        />
      );
    case "state-rte-form":
      return (
        <StateRTEForm
          onGenerate={onGenerate as (d: Record<string, string>) => void}
        />
      );
    default:
      return null;
  }
}

export function BoardDocumentPreview({
  docType,
  data,
  board,
  state,
}: {
  docType: BoardDocType;
  data: BoardPreviewData;
  board: BoardType;
  state: string;
}) {
  switch (docType) {
    case "cbse-provisional":
      return (
        <CBSEProvisionalPreview
          data={data as Record<string, string>}
          board={board}
          state={state}
        />
      );
    case "cbse-slc":
      return (
        <CBSESLCPreview
          data={data as Record<string, string>}
          board={board}
          state={state}
        />
      );
    case "icse-noc":
      return (
        <ICSENOCPreview
          data={data as Record<string, string>}
          board={board}
          state={state}
        />
      );
    case "icse-internal-assessment":
      return (
        <ICSEInternalAssessmentPreview
          data={data as Record<string, string | IARow[]>}
          board={board}
          state={state}
        />
      );
    case "state-caste-annexure":
      return (
        <StateCasteAnnexurePreview
          data={data as Record<string, string>}
          board={board}
          state={state}
        />
      );
    case "state-rte-form":
      return (
        <StateRTEPreview
          data={data as Record<string, string>}
          board={board}
          state={state}
        />
      );
    default:
      return null;
  }
}

// ════════════════════════════════════════════════════════════════════
// Board-specific extra fields for TC form (exported for DocumentsPage)
// ════════════════════════════════════════════════════════════════════
export function TCBoardExtraFields({
  board,
  state,
  form,
  setForm,
}: {
  board: BoardType;
  state: string;
  form: Record<string, string>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const sel = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));
  const yesNo = ["Yes", "No"];

  if (board === "cbse") {
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          CBSE Mandatory Fields
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CBSE Affiliation No">
            <Input
              value={form.affiliationNo || ""}
              onChange={set("affiliationNo")}
            />
          </Field>
          <Field label="Nationality">
            <Input
              value={form.nationality || "Indian"}
              onChange={set("nationality")}
            />
          </Field>
          <Field label="SC/ST Category">
            <Select value={form.scst || "No"} onValueChange={sel("scst")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yesNo.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date of First Admission">
            <Input
              type="date"
              value={form.firstAdmissionDate || ""}
              onChange={set("firstAdmissionDate")}
            />
          </Field>
          <Field label="DOB in Words">
            <Input
              value={form.dobInWords || ""}
              onChange={set("dobInWords")}
              placeholder="Fifteenth March Two Thousand Ten"
            />
          </Field>
          <Field label="NCC Cadet">
            <Select value={form.ncc || "No"} onValueChange={sel("ncc")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yesNo.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Boy Scout / Girl Guide">
            <Select value={form.scout || "No"} onValueChange={sel("scout")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yesNo.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Board Exam Last Appeared">
            <Select
              value={form.boardExam || "CBSE"}
              onValueChange={sel("boardExam")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CBSE">CBSE</SelectItem>
                <SelectItem value="CBSE Class 10">CBSE Class 10</SelectItem>
                <SelectItem value="CBSE Class 12">CBSE Class 12</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Games / Extra-Curricular">
          <Input
            value={form.games || ""}
            onChange={set("games")}
            placeholder="Cricket, Football, Drawing"
          />
        </Field>
        <Field label="Subjects Studied">
          <Input
            value={form.subjects || ""}
            onChange={set("subjects")}
            placeholder="English, Hindi, Maths, Science, Social Science"
          />
        </Field>
      </div>
    );
  }

  if (board === "icse") {
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
          ICSE / CISCE Fields
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CISCE School Code">
            <Input value={form.cisceCode || ""} onChange={set("cisceCode")} />
          </Field>
          <Field label="CISCE Registration No">
            <Input
              value={form.cisceRegistration || ""}
              onChange={set("cisceRegistration")}
            />
          </Field>
          <Field label="Index Number">
            <Input value={form.indexNo || ""} onChange={set("indexNo")} />
          </Field>
          <Field label="Board Exam Last Appeared">
            <Select
              value={form.icseExam || "None"}
              onValueChange={sel("icseExam")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ICSE">ICSE (Class 10)</SelectItem>
                <SelectItem value="ISC">ISC (Class 12)</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    );
  }

  if (board === "stateboard") {
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
          {state || "State"} Board Fields
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="UDISE Number">
            <Input value={form.udise || ""} onChange={set("udise")} />
          </Field>
          <Field label="District">
            <Input value={form.district || ""} onChange={set("district")} />
          </Field>
          <Field label="Taluka / Block">
            <Input value={form.taluka || ""} onChange={set("taluka")} />
          </Field>
          <Field label="Student Register Number">
            <Input value={form.registerNo || ""} onChange={set("registerNo")} />
          </Field>
          <Field label="Caste / Category">
            <Select
              value={form.casteCategory || "General"}
              onValueChange={sel("casteCategory")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["General", "OBC", "SC", "ST", "NT"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Medium of Instruction">
            <Select
              value={form.medium || "English"}
              onValueChange={sel("medium")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "English",
                  "Hindi",
                  "Marathi",
                  "Tamil",
                  "Telugu",
                  "Kannada",
                  "Bengali",
                  "Gujarati",
                  "Other",
                ].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Name in Regional Language">
            <Input
              value={form.nameRegional || ""}
              onChange={set("nameRegional")}
            />
          </Field>
          <Field label="SC/ST Fee Benefit Availed">
            <Select
              value={form.feeWaiver || "No"}
              onValueChange={sel("feeWaiver")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yesNo.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    );
  }

  return null;
}

// Board-specific extra fields for Admission Form
export function AdmissionBoardExtraFields({
  board,
  state,
  form,
  setForm,
}: {
  board: BoardType;
  state: string;
  form: Record<string, string | boolean>;
  setForm: React.Dispatch<
    React.SetStateAction<Record<string, string | boolean>>
  >;
}) {
  const setStr = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));
  const setSel = (k: string) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  if (board === "cbse") {
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          CBSE Specific Fields
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Aadhaar Number">
            <Input
              value={String(form.aadhaar || "")}
              onChange={setStr("aadhaar")}
              placeholder="12-digit"
            />
          </Field>
          <Field label="Category">
            <Select
              value={String(form.cbseCategory || "General")}
              onValueChange={setSel("cbseCategory")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["General", "OBC", "SC", "ST", "EWS"].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="CWSN (Special Needs)">
            <Select
              value={String(form.cwsn || "No")}
              onValueChange={setSel("cwsn")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="RTE Applicant">
            <Select
              value={String(form.rteApplicant || "No")}
              onValueChange={setSel("rteApplicant")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Prev. School CBSE Affil. No.">
            <Input
              value={String(form.prevAffiliation || "")}
              onChange={setStr("prevAffiliation")}
            />
          </Field>
          <Field label="Last Class Marks %">
            <Input
              value={String(form.lastMarks || "")}
              onChange={setStr("lastMarks")}
              placeholder="e.g. 82%"
            />
          </Field>
        </div>
      </div>
    );
  }

  if (board === "icse") {
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
          ICSE / CISCE Fields
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prev. School CISCE Code">
            <Input
              value={String(form.prevCisceCode || "")}
              onChange={setStr("prevCisceCode")}
            />
          </Field>
          <Field label="Council Registration Class">
            <Select
              value={String(form.councilClass || "None")}
              onValueChange={setSel("councilClass")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">Not Applicable</SelectItem>
                <SelectItem value="9-10 ICSE">Class 9–10 (ICSE)</SelectItem>
                <SelectItem value="11-12 ISC">Class 11–12 (ISC)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Stream (Class 11)">
            <Select
              value={String(form.stream || "N/A")}
              onValueChange={setSel("stream")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N/A">Not Applicable</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Commerce">Commerce</SelectItem>
                <SelectItem value="Arts">Arts / Humanities</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    );
  }

  if (board === "stateboard") {
    return (
      <div className="space-y-3 pt-3 border-t border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
          {state || "State"} Board Fields
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="UDISE Number">
            <Input
              value={String(form.udise || "")}
              onChange={setStr("udise")}
            />
          </Field>
          <Field label="Student Aadhaar">
            <Input
              value={String(form.aadhaar || "")}
              onChange={setStr("aadhaar")}
              placeholder="12-digit"
            />
          </Field>
          <Field label="Caste Certificate Number">
            <Input
              value={String(form.casteCertNo || "")}
              onChange={setStr("casteCertNo")}
            />
          </Field>
          <Field label="District">
            <Input
              value={String(form.district || "")}
              onChange={setStr("district")}
            />
          </Field>
          <Field label="Taluka">
            <Input
              value={String(form.taluka || "")}
              onChange={setStr("taluka")}
            />
          </Field>
          <Field label="Medium of Instruction">
            <Select
              value={String(form.medium || "English")}
              onValueChange={setSel("medium")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "English",
                  "Hindi",
                  "Marathi",
                  "Tamil",
                  "Telugu",
                  "Kannada",
                  "Bengali",
                  "Gujarati",
                  "Other",
                ].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mother Tongue">
            <Input
              value={String(form.motherTongue || "")}
              onChange={setStr("motherTongue")}
            />
          </Field>
          <Field label="BPL (Below Poverty Line)">
            <Select
              value={String(form.bpl || "No")}
              onValueChange={setSel("bpl")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="RTE Sec. 12 Beneficiary">
            <Select
              value={String(form.rteBeneficiary || "No")}
              onValueChange={setSel("rteBeneficiary")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    );
  }

  return null;
}
