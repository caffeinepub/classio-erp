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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianRupee, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

// Experience tiers: { minYears, label, salary (in rupees) }
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
    allowances: "0",
    deductions: "0",
  });

  const { data: payrollRecords, isLoading } =
    usePayrollByStaff(selectedStaffId);

  const selectedStaffMember = staff?.find((s) => s.id === selectedStaffId);

  // Find matching teacher record to get dateOfJoin for experience calc
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

  // When staff changes and mode is experience, auto-fill the basic salary
  useEffect(() => {
    if (salaryMode === "experience" && suggestedSalary !== null) {
      setForm((f) => ({ ...f, basicSalary: String(suggestedSalary) }));
    }
  }, [suggestedSalary, salaryMode]);

  const handleStaffChange = (id: string) => {
    setSelectedStaffId(id);
    setSalaryMode("experience");
  };

  const handleModeChange = (mode: "experience" | "manual") => {
    setSalaryMode(mode);
    if (mode === "experience" && suggestedSalary !== null) {
      setForm((f) => ({ ...f, basicSalary: String(suggestedSalary) }));
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error("Select a staff member");
      return;
    }
    const basic = BigInt(Number.parseInt(form.basicSalary) || 0);
    const allowances = BigInt(Number.parseInt(form.allowances) || 0);
    const deductions = BigInt(Number.parseInt(form.deductions) || 0);
    const netPay = basic + allowances - deductions;
    try {
      await generatePayroll.mutateAsync({
        staffId: selectedStaffId,
        month: BigInt(Number.parseInt(form.month)),
        year: BigInt(Number.parseInt(form.year)),
        basicSalary: basic,
        allowances,
        deductions,
        netPay,
      });
      toast.success("Payroll generated");
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Payroll"
        description="Generate and manage staff payroll records"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generate form */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" /> Generate Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Staff Member</Label>
                <Select
                  value={selectedStaffId}
                  onValueChange={handleStaffChange}
                >
                  <SelectTrigger data-ocid="payroll.staff.select">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {(staff ?? []).map((s) => (
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
                    onValueChange={(v) => setForm((f) => ({ ...f, month: v }))}
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

              {/* Salary Mode Selector */}
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
                    >
                      Manual
                    </button>
                  </div>
                </div>
              )}

              {/* Experience-based salary info */}
              {selectedStaffId && salaryMode === "experience" && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
                  <p className="text-xs font-semibold text-primary">
                    Salary Range (Experience-Based)
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

              <div className="space-y-1.5">
                <Label>Basic Salary (₹)</Label>
                <Input
                  data-ocid="payroll.basic.input"
                  type="number"
                  required
                  readOnly={salaryMode === "experience"}
                  value={form.basicSalary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basicSalary: e.target.value }))
                  }
                  className={
                    salaryMode === "experience"
                      ? "bg-muted cursor-not-allowed"
                      : ""
                  }
                />
                {salaryMode === "experience" && (
                  <p className="text-xs text-muted-foreground">
                    Auto-set from experience tier. Switch to Manual to override.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label>Allowances (₹)</Label>
                  <Input
                    data-ocid="payroll.allowances.input"
                    type="number"
                    value={form.allowances}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, allowances: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deductions (₹)</Label>
                  <Input
                    data-ocid="payroll.deductions.input"
                    type="number"
                    value={form.deductions}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deductions: e.target.value }))
                    }
                  />
                </div>
              </div>

              {form.basicSalary && (
                <div className="bg-muted rounded-md p-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Net Pay:</span>
                    <span className="font-semibold text-foreground">
                      {formatINR(
                        BigInt(Number.parseInt(form.basicSalary) || 0) +
                          BigInt(Number.parseInt(form.allowances) || 0) -
                          BigInt(Number.parseInt(form.deductions) || 0),
                      )}
                    </span>
                  </div>
                </div>
              )}

              <Button
                data-ocid="payroll.generate.primary_button"
                type="submit"
                className="w-full"
                disabled={generatePayroll.isPending}
              >
                {generatePayroll.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Payroll
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Records table */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="font-semibold text-sm">
                {selectedStaffId
                  ? `Payroll Records — ${selectedStaffMember?.firstName} ${selectedStaffMember?.lastName}`
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
                    <TableHead>Action</TableHead>
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
                      <TableCell className="text-green-600">
                        +{formatINR(r.allowances)}
                      </TableCell>
                      <TableCell className="text-red-500">
                        -{formatINR(r.deductions)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatINR(r.netPay)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.isPaid ? "paid" : "unpaid"} />
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
