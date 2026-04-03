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
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusBadge } from "../components/shared";
import {
  useAllStaff,
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

export default function PayrollPage() {
  const { data: staff } = useAllStaff();
  const generatePayroll = useGeneratePayroll();
  const markAsPaid = useMarkPayrollAsPaid();

  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [form, setForm] = useState({
    month: "1",
    year: String(new Date().getFullYear()),
    basicSalary: "",
    allowances: "0",
    deductions: "0",
  });

  const { data: payrollRecords, isLoading } =
    usePayrollByStaff(selectedStaffId);

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

  const selectedStaffMember = staff?.find((s) => s.id === selectedStaffId);

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
                  onValueChange={setSelectedStaffId}
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
              {selectedStaffId && (
                <p className="text-xs text-muted-foreground">
                  Contracted salary:{" "}
                  {formatINR(selectedStaffMember?.salary ?? BigInt(0))}
                </p>
              )}
              <div className="space-y-1.5">
                <Label>Basic Salary (₹)</Label>
                <Input
                  data-ocid="payroll.basic.input"
                  type="number"
                  required
                  value={form.basicSalary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basicSalary: e.target.value }))
                  }
                />
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
