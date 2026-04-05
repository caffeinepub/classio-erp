import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  CreditCard,
  IndianRupee,
  Loader2,
  Plus,
  Printer,
  TrendingUp,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import {
  useAllFeeStructures,
  useAllPayments,
  useAllStudentInvoices,
  useAllStudents,
  useCreatePayment,
  useTotalFeesCollected,
} from "../hooks/useQueries";
import { formatINR } from "../utils/currencyUtils";
import { bigIntToDateString } from "../utils/dateUtils";

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque",
  "Online",
  "DD",
];

const defaultForm = {
  invoiceId: "",
  studentId: "",
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  method: "",
  notes: "",
};

type ReceiptData = {
  receiptNo: string;
  studentName: string;
  studentGrade: string;
  paymentDate: string;
  amount: bigint;
  method: string;
  invoiceId: string;
  feesBreakdown: {
    tuition: number;
    activity: number;
    term: number;
    total: number;
  } | null;
};

function parseFeeDescForBreakdown(
  description: string,
): { tuition: number; activity: number; term: number; total: number } | null {
  try {
    const parsed = JSON.parse(description);
    if (typeof parsed === "object" && parsed !== null && "tuition" in parsed) {
      return {
        tuition: Number(parsed.tuition) || 0,
        activity: Number(parsed.activity) || 0,
        term: Number(parsed.term) || 0,
        total: Number(parsed.total) || 0,
      };
    }
  } catch {
    // not JSON
  }
  return null;
}

export default function PaymentsPage() {
  const { data: payments = [], isLoading } = useAllPayments();
  const { data: students = [] } = useAllStudents();
  const { data: invoices = [] } = useAllStudentInvoices();
  const { data: feeStructures = [] } = useAllFeeStructures();
  const { data: totalCollected = BigInt(0) } = useTotalFeesCollected();
  const createPayment = useCreatePayment();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const getStudent = (id: string) =>
    (students as any[]).find((s: any) => s.id === id);

  const studentFullName = (id: string) => {
    const s = getStudent(id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  const studentGrade = (id: string) => {
    const s = getStudent(id);
    if (!s) return "";
    const g = Number(s.grade);
    return g > 0 ? `Grade ${g}` : s.grade?.toString() || "";
  };

  const studentInvoices = (students as any[]).find(
    (s: any) => s.id === form.studentId,
  )
    ? (invoices as any[]).filter(
        (i: any) =>
          i.studentId === form.studentId &&
          (i.status === "unpaid" || i.status === "overdue"),
      )
    : [];

  // Balance due calculation helpers
  const calcTotalFees = (studentId: string) =>
    (invoices as any[])
      .filter((i: any) => i.studentId === studentId)
      .reduce((acc: number, i: any) => acc + Number(i.amount), 0);

  const calcTotalPaid = (studentId: string) =>
    (payments as any[])
      .filter((p: any) => p.studentId === studentId)
      .reduce((acc: number, p: any) => acc + Number(p.amount), 0);

  const calcBalanceDue = (studentId: string) => {
    const totalFees = calcTotalFees(studentId);
    const totalPaid = calcTotalPaid(studentId);
    return Math.max(0, totalFees - totalPaid);
  };

  const handleStudentSelect = (id: string) => {
    const balance = calcBalanceDue(id);
    setForm((p) => ({
      ...p,
      studentId: id,
      invoiceId: "",
      amount: balance > 0 ? String(balance) : "",
    }));
  };

  const handleInvoiceSelect = (id: string) => {
    const inv = (invoices as any[]).find((i: any) => i.id === id);
    setForm((p) => ({
      ...p,
      invoiceId: id,
      amount: inv ? String(Number(inv.amount)) : p.amount,
    }));
  };

  const buildReceiptData = (paidAmount: bigint): ReceiptData => {
    const s = getStudent(form.studentId);
    const name = s ? `${s.firstName} ${s.lastName}` : form.studentId;
    const grade = studentGrade(form.studentId);
    const receiptNo = `RCP-${String(Date.now()).slice(-6)}`;

    let feesBreakdown: ReceiptData["feesBreakdown"] = null;
    if (s) {
      const gNumber = Number(s.grade);
      const gradeLabel =
        gNumber > 0 ? `Grade ${gNumber}` : s.grade?.toString() || "";
      const matchingFS = (feeStructures as any[]).find(
        (fs: any) =>
          fs.isActive &&
          (fs.gradeLevel === gradeLabel || fs.gradeLevel === "All Grades"),
      );
      if (matchingFS) {
        feesBreakdown = parseFeeDescForBreakdown(matchingFS.description);
      }
    }

    return {
      receiptNo,
      studentName: name,
      studentGrade: grade,
      paymentDate: form.paymentDate,
      amount: paidAmount,
      method: form.method,
      invoiceId: form.invoiceId,
      feesBreakdown,
    };
  };

  const handleSubmit = async () => {
    if (!form.studentId || !form.amount || !form.method) {
      toast.error("Student, amount and payment method are required");
      return;
    }
    const paidAmount = BigInt(Math.round(Number(form.amount)));
    const receipt = buildReceiptData(paidAmount);
    try {
      await createPayment.mutateAsync({
        invoiceId: form.invoiceId || "manual",
        studentId: form.studentId,
        amount: paidAmount,
        paymentDate: BigInt(new Date(form.paymentDate).getTime()),
        method: form.method,
        notes: form.notes,
      });
      toast.success("Payment recorded successfully");
      setReceiptData(receipt);
      setForm(defaultForm);
      setOpen(false);
      setShowReceipt(true);
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const todayCollected = (payments as any[])
    .filter((p: any) => {
      const d = new Date(Number(p.paymentDate));
      const today = new Date();
      return d.toDateString() === today.toDateString();
    })
    .reduce((acc: number, p: any) => acc + Number(p.amount), 0);

  return (
    <>
      <style>{`
        @media print {
          body > *:not(.receipt-print-wrapper) { display: none !important; }
          .receipt-print-wrapper { display: block !important; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      {showReceipt && receiptData && (
        <div className="receipt-print-wrapper fixed inset-0 z-50 flex items-center justify-center bg-black/50 no-print-bg">
          <div
            ref={receiptRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            data-ocid="payments.modal"
          >
            <div className="bg-primary p-5 text-primary-foreground">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span className="font-bold text-lg">Classio ERP</span>
                </div>
                <button
                  type="button"
                  className="no-print rounded-full p-1 hover:bg-white/20 transition-colors"
                  data-ocid="payments.close_button"
                  onClick={() => setShowReceipt(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Payment Receipt
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Payment Successful</span>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt No.</span>
                  <span className="font-mono font-bold">
                    {receiptData.receiptNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student Name</span>
                  <span className="font-semibold">
                    {receiptData.studentName}
                  </span>
                </div>
                {receiptData.studentGrade && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade</span>
                    <span>{receiptData.studentGrade}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span>{receiptData.paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>{receiptData.method}</span>
                </div>
                {receiptData.invoiceId &&
                  receiptData.invoiceId !== "manual" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Invoice Ref.
                      </span>
                      <span className="font-mono text-xs">
                        {receiptData.invoiceId.slice(0, 8)}...
                      </span>
                    </div>
                  )}
              </div>

              {receiptData.feesBreakdown && (
                <div className="rounded-lg bg-muted/40 p-4 space-y-2 text-sm">
                  <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    Fee Breakdown
                  </p>
                  {receiptData.feesBreakdown.tuition > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tuition Fees
                      </span>
                      <span>
                        {formatINR(receiptData.feesBreakdown.tuition)}
                      </span>
                    </div>
                  )}
                  {receiptData.feesBreakdown.activity > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Activity Fees
                      </span>
                      <span>
                        {formatINR(receiptData.feesBreakdown.activity)}
                      </span>
                    </div>
                  )}
                  {receiptData.feesBreakdown.term > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Term Fees</span>
                      <span>{formatINR(receiptData.feesBreakdown.term)}</span>
                    </div>
                  )}
                  {receiptData.feesBreakdown.total > 0 && (
                    <div className="flex justify-between border-t border-border pt-2 mt-1">
                      <span className="font-semibold">Total Fees</span>
                      <span className="font-semibold">
                        {formatINR(receiptData.feesBreakdown.total)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg bg-success/10 border border-success/30 p-4 flex justify-between items-center">
                <span className="font-semibold text-success">Amount Paid</span>
                <span className="text-2xl font-bold text-success">
                  {formatINR(receiptData.amount)}
                </span>
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-3 no-print">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                data-ocid="payments.cancel_button"
                onClick={() => setShowReceipt(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 gap-2"
                data-ocid="payments.submit_button"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        <PageHeader
          title="Payments"
          description="Record and track fee payments from students. Select a student to generate a receipt."
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  data-ocid="payments.open_modal_button"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg" data-ocid="payments.dialog">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Record Payment
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* Step 1: Select Student — Combobox */}
                  <div className="space-y-1.5">
                    <Label>Select Student *</Label>
                    <Popover
                      open={studentPopoverOpen}
                      onOpenChange={setStudentPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          aria-expanded={studentPopoverOpen}
                          aria-haspopup="listbox"
                          className="w-full justify-between font-normal"
                          data-ocid="payments.select"
                        >
                          {form.studentId
                            ? studentFullName(form.studentId)
                            : "Search and select student"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search student..."
                            data-ocid="payments.search_input"
                          />
                          <CommandList>
                            <CommandEmpty>No students found</CommandEmpty>
                            <CommandGroup>
                              {(students as any[]).map((s: any) => (
                                <CommandItem
                                  key={s.id}
                                  value={`${s.firstName} ${s.lastName}`}
                                  onSelect={() => {
                                    handleStudentSelect(s.id);
                                    setStudentPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.studentId === s.id
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <span className="font-medium">
                                    {s.firstName} {s.lastName}
                                  </span>
                                  {Number(s.grade) > 0 && (
                                    <span className="text-muted-foreground ml-2 text-xs">
                                      · Grade {Number(s.grade)}
                                    </span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {form.studentId && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-success" />
                        {studentGrade(form.studentId) || "No grade assigned"}
                      </p>
                    )}
                  </div>

                  {/* Balance Due Panel */}
                  {form.studentId &&
                    (() => {
                      const totalFees = calcTotalFees(form.studentId);
                      const totalPaid = calcTotalPaid(form.studentId);
                      const balance = Math.max(0, totalFees - totalPaid);
                      const isCleared = balance === 0;
                      return (
                        <div
                          className={`rounded-lg border p-3 text-sm ${isCleared ? "border-success/30 bg-success/5" : "border-orange-300/40 bg-orange-50/60"}`}
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">
                                Total Fees:{" "}
                                <span className="font-semibold text-foreground">
                                  {formatINR(BigInt(totalFees))}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                Paid:{" "}
                                <span className="font-semibold text-success">
                                  {formatINR(BigInt(totalPaid))}
                                </span>
                              </span>
                            </div>
                            <div className="font-bold">
                              {isCleared ? (
                                <span className="text-success flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> No
                                  balance due
                                </span>
                              ) : (
                                <span className="text-orange-600">
                                  Balance Due: {formatINR(BigInt(balance))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  {/* Step 2: Select Invoice */}
                  {form.studentId && (
                    <div className="space-y-1.5">
                      <Label>Select Invoice (optional)</Label>
                      {studentInvoices.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground text-center">
                          No pending invoices for this student
                        </div>
                      ) : (
                        <Select
                          value={form.invoiceId}
                          onValueChange={handleInvoiceSelect}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice" />
                          </SelectTrigger>
                          <SelectContent>
                            {studentInvoices.map((inv: any) => (
                              <SelectItem key={inv.id} value={inv.id}>
                                <span>Invoice #{inv.id.slice(0, 8)}</span>
                                <span className="ml-2 text-muted-foreground">
                                  —
                                </span>
                                <span className="ml-1 font-medium">
                                  {formatINR(inv.amount)}
                                </span>
                                {inv.status === "overdue" && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-destructive border-destructive/30 bg-destructive/5 text-xs"
                                  >
                                    Overdue
                                  </Badge>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {/* Step 3: Amount and Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Amount (₹) *</Label>
                      <Input
                        data-ocid="payments.input"
                        type="number"
                        placeholder="0"
                        value={form.amount}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, amount: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={form.paymentDate}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            paymentDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Step 4: Method */}
                  <div className="space-y-1.5">
                    <Label>Payment Method *</Label>
                    <Select
                      value={form.method}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, method: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step 5: Notes */}
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea
                      data-ocid="payments.textarea"
                      placeholder="Optional notes..."
                      value={form.notes}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, notes: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    data-ocid="payments.cancel_button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-ocid="payments.submit_button"
                    onClick={handleSubmit}
                    disabled={createPayment.isPending}
                  >
                    {createPayment.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Record & Generate Receipt
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-card border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-success" />
                Total Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">
                {formatINR(totalCollected)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Today's Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {formatINR(todayCollected)}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-l-4 border-l-accent-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{(payments as any[]).length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-card">
          <Table data-ocid="payments.table">
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Balance Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12"
                    data-ocid="payments.loading_state"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : (payments as any[]).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                    data-ocid="payments.empty_state"
                  >
                    No payments recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                (payments as any[]).map((payment: any, i: number) => (
                  <TableRow
                    key={payment.id}
                    data-ocid={`payments.item.${i + 1}`}
                  >
                    <TableCell className="font-bold text-foreground">
                      {studentFullName(payment.studentId)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {studentGrade(payment.studentId) || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.invoiceId && payment.invoiceId !== "manual" ? (
                        `#${payment.invoiceId.slice(0, 8)}...`
                      ) : (
                        <span className="italic">Manual</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatINR(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm">
                        <CreditCard className="h-3 w-3" />
                        {payment.method}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {bigIntToDateString(payment.paymentDate)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.notes || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {(() => {
                        const bal = calcBalanceDue(payment.studentId);
                        return bal > 0 ? (
                          <span className="text-orange-600">
                            {formatINR(BigInt(bal))}
                          </span>
                        ) : (
                          <span className="text-success">Cleared</span>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
