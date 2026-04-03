import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, IndianRupee, Loader2, Printer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { PayrollRecord } from "../backend.d";
import { EmptyState, PageHeader, StatusBadge } from "../components/shared";
import {
  useAllStaff,
  useAllTeachers,
  useGeneratePayroll,
  useMarkPayrollAsPaid,
  usePayrollByStaff,
} from "../hooks/useQueries";
import { formatINR } from "../utils/currencyUtils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EXPERIENCE_TIERS = [
  { minYears: 15, label: "15+ years", salary: 40000 },
  { minYears: 5, label: "5+ years", salary: 30000 },
  { minYears: 2, label: "2+ years", salary: 10000 },
  { minYears: 0, label: "< 2 years", salary: 10000 },
];

function getYearsOfExperience(dateOfJoinMs: bigint): number {
  const joinMs = Number(dateOfJoinMs) / 1_000_000;
  const now = Date.now();
  return Math.floor((now - joinMs) / (1000 * 60 * 60 * 24 * 365.25));
}

function getSuggestedSalary(years: number): number {
  for (const tier of EXPERIENCE_TIERS) {
    if (years >= tier.minYears) return tier.salary;
  }
  return 10000;
}

function getTierLabel(years: number): string {
  if (years >= 15) return "15+ years experience";
  if (years >= 5) return "5+ years experience";
  if (years >= 2) return "2+ years experience";
  return "Less than 2 years experience";
}

function formatAmt(n: number): string {
  return `20b9${n.toLocaleString("en-IN")}`;
}

interface PayrollBreakdown {
  hra: number;
  conveyance: number;
  medical: number;
  specialAllowance: number;
  pf: number;
  tds: number;
  professionalTax: number;
  absentDays: number;
  absentDeduction: number;
  otherDeductions: number;
}

interface SalarySlipDialogProps {
  open: boolean;
  onClose: () => void;
  record: PayrollRecord;
  employeeName: string;
  designation: string;
}

function SalarySlipDialog({
  open,
  onClose,
  record,
  employeeName,
  designation,
}: SalarySlipDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const basic = Number(record.basicSalary);
  const storageKey = `payroll_breakdown_${record.staffId}_${record.month}_${record.year}`;
  const stored = localStorage.getItem(storageKey);

  let breakdown: PayrollBreakdown;
  if (stored) {
    try {
      breakdown = JSON.parse(stored) as PayrollBreakdown;
    } catch {
      breakdown = deriveBreakdown(
        basic,
        Number(record.allowances),
        Number(record.deductions),
      );
    }
  } else {
    breakdown = deriveBreakdown(
      basic,
      Number(record.allowances),
      Number(record.deductions),
    );
  }

  const grossEarnings =
    basic +
    breakdown.hra +
    breakdown.conveyance +
    breakdown.medical +
    breakdown.specialAllowance;
  const totalDeductions =
    breakdown.pf +
    breakdown.tds +
    breakdown.professionalTax +
    breakdown.absentDeduction +
    breakdown.otherDeductions;
  const netPay = grossEarnings - totalDeductions;

  const monthName = MONTHS[Number(record.month) - 1] ?? String(record.month);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${employeeName} - ${monthName} ${Number(record.year)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0891b2; padding-bottom: 16px; margin-bottom: 16px; }
            .company-name { font-size: 20px; font-weight: bold; }
            .company-sub { font-size: 12px; color: #666; }
            .slip-title { text-align: right; }
            .slip-title h2 { font-size: 18px; font-weight: bold; color: #0891b2; margin: 0; }
            .emp-details { background: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .emp-field label { font-size: 10px; color: #666; display: block; }
            .emp-field span { font-size: 13px; font-weight: 500; }
            .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            .salary-table th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #444; }
            .salary-table td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
            .salary-table .label { color: #555; }
            .salary-table .amount-green { color: #16a34a; font-weight: 500; text-align: right; }
            .salary-table .amount-red { color: #dc2626; font-weight: 500; text-align: right; }
            .salary-table .total-row td { font-weight: bold; border-top: 2px solid #e2e8f0; padding-top: 10px; }
            .net-pay-box { background: #e0f2fe; border: 1px solid #0891b2; border-radius: 8px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .net-pay-label { font-size: 14px; font-weight: 600; color: #0369a1; }
            .net-pay-amount { font-size: 24px; font-weight: bold; color: #0369a1; }
            .footer-note { text-align: center; font-size: 11px; color: #999; border-top: 1px dashed #ccc; padding-top: 12px; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="payroll.slip.dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Salary Slip — {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef}>
          {/* Slip Header */}
          <div className="header flex items-start justify-between border-b-2 border-primary pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
                  alt="Classio ERP"
                  className="w-9 h-9 object-cover rounded"
                />
              </div>
              <div>
                <div className="company-name font-bold text-lg text-foreground">
                  Classio ERP
                </div>
                <div className="company-sub text-xs text-muted-foreground">
                  School Management System
                </div>
              </div>
            </div>
            <div className="slip-title text-right">
              <h2 className="text-lg font-bold text-primary">SALARY SLIP</h2>
              <p className="text-sm text-muted-foreground">
                {monthName} {Number(record.year)}
              </p>
            </div>
          </div>

          {/* Employee Details */}
          <div className="emp-details grid grid-cols-2 gap-3 bg-muted/30 rounded-lg p-4 mb-4">
            <div className="emp-field">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Employee Name
              </p>
              <span className="text-sm font-semibold block mt-0.5">
                {employeeName}
              </span>
            </div>
            <div className="emp-field">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Employee ID
              </p>
              <span className="text-sm font-mono font-medium block mt-0.5">
                {record.staffId.slice(0, 10).toUpperCase()}
              </span>
            </div>
            <div className="emp-field">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Designation
              </p>
              <span className="text-sm font-medium block mt-0.5">
                {designation}
              </span>
            </div>
            <div className="emp-field">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Pay Period
              </p>
              <span className="text-sm font-medium block mt-0.5">
                {monthName} {Number(record.year)}
              </span>
            </div>
          </div>

          {/* Earnings & Deductions side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Earnings */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-emerald-50 border-b border-border px-3 py-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Earnings
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-medium text-emerald-700">
                    {formatAmt(basic)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">HRA</span>
                  <span className="font-medium text-emerald-700">
                    {formatAmt(breakdown.hra)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Conveyance Allowance
                  </span>
                  <span className="font-medium text-emerald-700">
                    {formatAmt(breakdown.conveyance)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Medical Allowance
                  </span>
                  <span className="font-medium text-emerald-700">
                    {formatAmt(breakdown.medical)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Special Allowance
                  </span>
                  <span className="font-medium text-emerald-700">
                    {formatAmt(breakdown.specialAllowance)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2.5 text-sm bg-emerald-50/60">
                  <span className="font-bold text-emerald-800">
                    Gross Earnings
                  </span>
                  <span className="font-bold text-emerald-800">
                    {formatAmt(grossEarnings)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-red-50 border-b border-border px-3 py-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Deductions
                </h3>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Provident Fund (PF)
                  </span>
                  <span className="font-medium text-red-600">
                    {formatAmt(breakdown.pf)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    TDS / Income Tax
                  </span>
                  <span className="font-medium text-red-600">
                    {formatAmt(breakdown.tds)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Professional Tax
                  </span>
                  <span className="font-medium text-red-600">
                    {formatAmt(breakdown.professionalTax)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Absent Day Deduction
                  </span>
                  <span className="font-medium text-red-600">
                    {formatAmt(breakdown.absentDeduction)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    Other Deductions
                  </span>
                  <span className="font-medium text-red-600">
                    {formatAmt(breakdown.otherDeductions)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2.5 text-sm bg-red-50/60">
                  <span className="font-bold text-red-800">
                    Total Deductions
                  </span>
                  <span className="font-bold text-red-800">
                    {formatAmt(totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-primary">NET PAY</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gross Earnings − Total Deductions
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatAmt(netPay)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                For {monthName} {Number(record.year)}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-center text-muted-foreground border-t border-dashed border-border pt-3">
            This is a computer-generated salary slip. No signature required.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 no-print">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="payroll.slip.close_button"
          >
            Close
          </Button>
          <Button onClick={handlePrint} data-ocid="payroll.slip.primary_button">
            <Printer className="h-4 w-4 mr-2" /> Print / Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function deriveBreakdown(
  basic: number,
  allowances: number,
  deductions: number,
): PayrollBreakdown {
  const hra = Math.round(basic * 0.4);
  const conveyance = 1600;
  const medical = 1250;
  const specialAllowance = Math.max(0, allowances - hra - conveyance - medical);
  const pf = Math.round(basic * 0.12);
  const professionalTax = 200;
  const tdsAndOther = Math.max(0, deductions - pf - professionalTax);
  return {
    hra,
    conveyance,
    medical,
    specialAllowance,
    pf,
    tds: tdsAndOther,
    professionalTax,
    absentDays: 0,
    absentDeduction: 0,
    otherDeductions: 0,
  };
}

export default function PayrollPage() {
  const { data: staff } = useAllStaff();
  const { data: teachers } = useAllTeachers();
  const generatePayroll = useGeneratePayroll();
  const markAsPaid = useMarkPayrollAsPaid();

  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [salaryMode, setSalaryMode] = useState<"experience" | "manual">(
    "experience",
  );
  const [form, setForm] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    basicSalary: "",
    hra: "",
    conveyance: "1600",
    medical: "1250",
    specialAllowance: "0",
    pf: "",
    tds: "0",
    professionalTax: "200",
    absentDays: "0",
    otherDeductions: "0",
  });

  const [selectedSlipRecord, setSelectedSlipRecord] =
    useState<PayrollRecord | null>(null);
  const [showSlipDialog, setShowSlipDialog] = useState(false);

  const { data: payrollRecords, isLoading } =
    usePayrollByStaff(selectedStaffId);

  // Build merged staff + teachers list (deduplicated)
  const staffList = useMemo(() => {
    const map = new Map<
      string,
      { id: string; firstName: string; lastName: string }
    >();
    for (const s of staff ?? []) {
      const key = `${s.firstName}${s.lastName}`.toLowerCase();
      map.set(key, { id: s.id, firstName: s.firstName, lastName: s.lastName });
    }
    for (const t of teachers ?? []) {
      const key = `${t.firstName}${t.lastName}`.toLowerCase();
      if (!map.has(key))
        map.set(key, {
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
        });
    }
    return Array.from(map.values());
  }, [staff, teachers]);

  const selectedStaffMember = staff?.find((s) => s.id === selectedStaffId);

  const matchingTeacher = teachers?.find(
    (t) =>
      selectedStaffMember &&
      `${t.firstName}${t.lastName}` ===
        `${selectedStaffMember.firstName}${selectedStaffMember.lastName}`,
  );

  const yearsOfExp = matchingTeacher
    ? getYearsOfExperience(matchingTeacher.dateOfJoin)
    : null;

  const suggestedSalary =
    yearsOfExp !== null ? getSuggestedSalary(yearsOfExp) : null;

  // Auto-fill basic salary + derived fields when staff / mode changes
  useEffect(() => {
    if (salaryMode === "experience" && suggestedSalary !== null) {
      const basic = suggestedSalary;
      const hra = Math.round(basic * 0.4);
      const pf = Math.round(basic * 0.12);
      setForm((f) => ({
        ...f,
        basicSalary: String(basic),
        hra: String(hra),
        pf: String(pf),
      }));
    }
  }, [suggestedSalary, salaryMode]);

  // Auto-recalculate HRA and PF when basicSalary changes in manual mode
  const handleBasicChange = (value: string) => {
    const basic = Number.parseInt(value) || 0;
    const hra = Math.round(basic * 0.4);
    const pf = Math.round(basic * 0.12);
    setForm((f) => ({
      ...f,
      basicSalary: value,
      hra: String(hra),
      pf: String(pf),
    }));
  };

  // Derived absent deduction (read-only)
  const basicNum = Number.parseInt(form.basicSalary) || 0;
  const absentDaysNum = Number.parseInt(form.absentDays) || 0;
  const absentDeduction = Math.floor(basicNum / 26) * absentDaysNum;

  // Live preview calculations
  const hraNum = Number.parseInt(form.hra) || 0;
  const conveyanceNum = Number.parseInt(form.conveyance) || 0;
  const medicalNum = Number.parseInt(form.medical) || 0;
  const specialNum = Number.parseInt(form.specialAllowance) || 0;
  const pfNum = Number.parseInt(form.pf) || 0;
  const tdsNum = Number.parseInt(form.tds) || 0;
  const ptNum = Number.parseInt(form.professionalTax) || 0;
  const otherDedNum = Number.parseInt(form.otherDeductions) || 0;

  const grossEarnings =
    basicNum + hraNum + conveyanceNum + medicalNum + specialNum;
  const totalDeductions =
    pfNum + tdsNum + ptNum + absentDeduction + otherDedNum;
  const netPay = grossEarnings - totalDeductions;

  const handleStaffChange = (id: string) => {
    setSelectedStaffId(id);
    setSalaryMode("experience");
  };

  const handleModeChange = (mode: "experience" | "manual") => {
    setSalaryMode(mode);
    if (mode === "experience" && suggestedSalary !== null) {
      const basic = suggestedSalary;
      const hra = Math.round(basic * 0.4);
      const pf = Math.round(basic * 0.12);
      setForm((f) => ({
        ...f,
        basicSalary: String(basic),
        hra: String(hra),
        pf: String(pf),
      }));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error("Select a staff member");
      return;
    }
    const totalAllowances = hraNum + conveyanceNum + medicalNum + specialNum;
    const totalDed = pfNum + tdsNum + ptNum + absentDeduction + otherDedNum;
    const net = grossEarnings - totalDed;

    try {
      await generatePayroll.mutateAsync({
        staffId: selectedStaffId,
        month: BigInt(Number.parseInt(form.month)),
        year: BigInt(Number.parseInt(form.year)),
        basicSalary: BigInt(basicNum),
        allowances: BigInt(totalAllowances),
        deductions: BigInt(totalDed),
        netPay: BigInt(net),
      });

      // Save breakdown to localStorage for salary slip generation
      const storageKey = `payroll_breakdown_${selectedStaffId}_${form.month}_${form.year}`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          hra: hraNum,
          conveyance: conveyanceNum,
          medical: medicalNum,
          specialAllowance: specialNum,
          pf: pfNum,
          tds: tdsNum,
          professionalTax: ptNum,
          absentDays: absentDaysNum,
          absentDeduction,
          otherDeductions: otherDedNum,
        }),
      );

      toast.success("Payroll generated successfully");
    } catch {
      toast.error("Failed to generate payroll");
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markAsPaid.mutateAsync(id);
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed to mark as paid");
    }
  };

  const getEmployeeName = (record: PayrollRecord) => {
    const found = staffList.find((s) => s.id === record.staffId);
    return found ? `${found.firstName} ${found.lastName}` : record.staffId;
  };

  const getDesignation = (record: PayrollRecord) => {
    const staffMember = staff?.find((s) => s.id === record.staffId);
    return staffMember?.position ?? "Teacher";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Payroll"
        description="Generate and manage staff payroll records with itemized salary components"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate form */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" /> Generate
                Payroll
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-3">
                {/* Staff + Period */}
                <div className="space-y-1.5">
                  <Label>Staff / Teacher</Label>
                  <Select
                    value={selectedStaffId}
                    onValueChange={handleStaffChange}
                  >
                    <SelectTrigger data-ocid="payroll.staff.select">
                      <SelectValue placeholder="Select staff or teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Month</Label>
                    <Select
                      value={form.month}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, month: v }))
                      }
                    >
                      <SelectTrigger data-ocid="payroll.month.select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={m} value={String(i + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year</Label>
                    <Input
                      data-ocid="payroll.year.input"
                      type="number"
                      value={form.year}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, year: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Salary Mode */}
                {selectedStaffId && (
                  <div className="space-y-2">
                    <Label>Salary Type</Label>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleModeChange("experience")}
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                          salaryMode === "experience"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                        data-ocid="payroll.experience_mode.toggle"
                      >
                        By Experience
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange("manual")}
                        className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                          salaryMode === "manual"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                        data-ocid="payroll.manual_mode.toggle"
                      >
                        Manual
                      </button>
                    </div>
                  </div>
                )}

                {/* Experience tier panel */}
                {selectedStaffId && salaryMode === "experience" && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
                    <p className="text-xs font-semibold text-primary">
                      Experience-Based Salary
                    </p>
                    <div className="space-y-1">
                      {EXPERIENCE_TIERS.filter((t) => t.minYears > 0).map(
                        (tier) => (
                          <div
                            key={tier.minYears}
                            className={`flex justify-between text-xs px-2 py-1 rounded ${
                              yearsOfExp !== null && yearsOfExp >= tier.minYears
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>{tier.label}</span>
                            <span>₹{tier.salary.toLocaleString("en-IN")}</span>
                          </div>
                        ),
                      )}
                    </div>
                    {yearsOfExp !== null && (
                      <div className="pt-1 border-t border-primary/20">
                        <p className="text-xs text-muted-foreground">
                          Experience:{" "}
                          <span className="font-semibold text-foreground">
                            {yearsOfExp} yr{yearsOfExp !== 1 ? "s" : ""}
                          </span>
                          {" — "}
                          <span className="text-primary">
                            {getTierLabel(yearsOfExp)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Basic Salary */}
                <div className="space-y-1.5">
                  <Label>Basic Salary (₹)</Label>
                  <Input
                    data-ocid="payroll.basic.input"
                    type="number"
                    required
                    readOnly={salaryMode === "experience"}
                    value={form.basicSalary}
                    onChange={(e) => handleBasicChange(e.target.value)}
                    className={
                      salaryMode === "experience"
                        ? "bg-muted cursor-not-allowed"
                        : ""
                    }
                  />
                  {salaryMode === "experience" && (
                    <p className="text-xs text-muted-foreground">
                      Auto-set from experience tier.
                    </p>
                  )}
                </div>

                {/* Allowances section */}
                <div className="border border-border rounded-lg p-3 space-y-2.5">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Allowances
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">HRA (₹)</Label>
                      <Input
                        data-ocid="payroll.hra.input"
                        type="number"
                        value={form.hra}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, hra: e.target.value }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">
                        Conveyance (₹)
                      </Label>
                      <Input
                        data-ocid="payroll.conveyance.input"
                        type="number"
                        value={form.conveyance}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, conveyance: e.target.value }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">
                        Medical (₹)
                      </Label>
                      <Input
                        data-ocid="payroll.medical.input"
                        type="number"
                        value={form.medical}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, medical: e.target.value }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">
                        Special Allow. (₹)
                      </Label>
                      <Input
                        data-ocid="payroll.special_allowance.input"
                        type="number"
                        value={form.specialAllowance}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            specialAllowance: e.target.value,
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions section */}
                <div className="border border-border rounded-lg p-3 space-y-2.5">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                    Deductions
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">PF (₹)</Label>
                      <Input
                        data-ocid="payroll.pf.input"
                        type="number"
                        value={form.pf}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, pf: e.target.value }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">
                        TDS / Income Tax (₹)
                      </Label>
                      <Input
                        data-ocid="payroll.tds.input"
                        type="number"
                        value={form.tds}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, tds: e.target.value }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">
                        Professional Tax (₹)
                      </Label>
                      <Input
                        data-ocid="payroll.professional_tax.input"
                        type="number"
                        value={form.professionalTax}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            professionalTax: e.target.value,
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">
                        Absent Days
                      </Label>
                      <Input
                        data-ocid="payroll.absent_days.input"
                        type="number"
                        min="0"
                        value={form.absentDays}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, absentDays: e.target.value }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    {absentDeduction > 0 && (
                      <div className="flex items-center justify-between text-xs bg-red-50 rounded px-2 py-1">
                        <span className="text-muted-foreground">
                          Absent Deduction (auto)
                        </span>
                        <span className="font-semibold text-red-600">
                          −₹{absentDeduction.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Label className="w-32 text-xs shrink-0">
                        Other Deductions (₹)
                      </Label>
                      <Input
                        data-ocid="payroll.other_deductions.input"
                        type="number"
                        value={form.otherDeductions}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            otherDeductions: e.target.value,
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  data-ocid="payroll.generate.primary_button"
                  type="submit"
                  className="w-full"
                  disabled={generatePayroll.isPending || !form.basicSalary}
                >
                  {generatePayroll.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Payroll
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview */}
          {form.basicSalary && (
            <Card className="shadow-card border-2 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-primary">
                  Live Pay Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {/* Earnings */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 mb-1.5">
                    Earnings
                  </p>
                  <div className="space-y-1">
                    {[
                      ["Basic Salary", basicNum],
                      ["HRA", hraNum],
                      ["Conveyance Allowance", conveyanceNum],
                      ["Medical Allowance", medicalNum],
                      ["Special Allowance", specialNum],
                    ].map(([label, amount]) => (
                      <div
                        key={String(label)}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-emerald-700">
                          ₹{Number(amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-1 flex justify-between text-xs font-bold">
                      <span>Gross Earnings</span>
                      <span className="text-emerald-700">
                        ₹{grossEarnings.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-red-700 mb-1.5">
                    Deductions
                  </p>
                  <div className="space-y-1">
                    {[
                      ["Provident Fund (PF)", pfNum],
                      ["TDS / Income Tax", tdsNum],
                      ["Professional Tax", ptNum],
                      ["Absent Day Deduction", absentDeduction],
                      ["Other Deductions", otherDedNum],
                    ].map(([label, amount]) => (
                      <div
                        key={String(label)}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium text-red-600">
                          ₹{Number(amount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-1 flex justify-between text-xs font-bold">
                      <span>Total Deductions</span>
                      <span className="text-red-700">
                        ₹{totalDeductions.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="rounded-lg bg-primary/10 border border-primary/25 px-3 py-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-primary">
                    NET PAY
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ₹{netPay.toLocaleString("en-IN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Records table */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="font-semibold text-sm">
                {selectedStaffId
                  ? `Payroll Records — ${selectedStaffMember?.firstName ?? ""} ${selectedStaffMember?.lastName ?? ""}`
                  : "Select a staff member to view records"}
              </p>
            </div>
            {!selectedStaffId ? (
              <EmptyState
                title="Select a staff member"
                description="Choose from the left to view payroll records"
                ocid="payroll.records.empty_state"
              />
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !payrollRecords || payrollRecords.length === 0 ? (
              <EmptyState
                title="No payroll records"
                description="Generate the first payroll for this staff member"
                ocid="payroll.records.empty_state"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Period</TableHead>
                    <TableHead>Basic</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((r, i) => (
                    <TableRow
                      key={r.id}
                      data-ocid={`payroll.list.item.${i + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-medium">
                        {MONTHS[Number(r.month) - 1]} {Number(r.year)}
                      </TableCell>
                      <TableCell>{formatINR(r.basicSalary)}</TableCell>
                      <TableCell className="text-emerald-600">
                        +{formatINR(r.allowances)}
                      </TableCell>
                      <TableCell className="text-red-500">
                        −{formatINR(r.deductions)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatINR(r.netPay)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.isPaid ? "paid" : "unpaid"} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!r.isPaid && (
                            <button
                              type="button"
                              data-ocid={`payroll.list.markpaid.${i + 1}`}
                              onClick={() => handleMarkPaid(r.id)}
                              disabled={markAsPaid.isPending}
                              className="text-xs text-primary hover:underline"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            type="button"
                            data-ocid={`payroll.list.slip.${i + 1}`}
                            onClick={() => {
                              setSelectedSlipRecord(r);
                              setShowSlipDialog(true);
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Salary Slip
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Salary Slip Dialog */}
      {selectedSlipRecord && (
        <SalarySlipDialog
          open={showSlipDialog}
          onClose={() => setShowSlipDialog(false)}
          record={selectedSlipRecord}
          employeeName={getEmployeeName(selectedSlipRecord)}
          designation={getDesignation(selectedSlipRecord)}
        />
      )}
    </div>
  );
}
