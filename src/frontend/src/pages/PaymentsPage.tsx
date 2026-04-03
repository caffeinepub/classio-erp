import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  CreditCard,
  IndianRupee,
  Loader2,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import {
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

export default function PaymentsPage() {
  const { data: payments = [], isLoading } = useAllPayments();
  const { data: students = [] } = useAllStudents();
  const { data: invoices = [] } = useAllStudentInvoices();
  const { data: totalCollected = BigInt(0) } = useTotalFeesCollected();
  const createPayment = useCreatePayment();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const studentName = (id: string) => {
    const s = (students as any[]).find((s: any) => s.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  const invoiceLabel = (id: string) => {
    const inv = (invoices as any[]).find((i: any) => i.id === id);
    if (!inv) return id;
    return `${studentName(inv.studentId)} — ${formatINR(inv.amount)}`;
  };

  const handleInvoiceSelect = (id: string) => {
    const inv = (invoices as any[]).find((i: any) => i.id === id);
    setForm((p) => ({
      ...p,
      invoiceId: id,
      studentId: inv ? inv.studentId : p.studentId,
      amount: inv ? String(Number(inv.amount)) : p.amount,
    }));
  };

  const handleSubmit = async () => {
    if (!form.invoiceId || !form.studentId || !form.amount || !form.method) {
      toast.error("Invoice, student, amount and payment method are required");
      return;
    }
    try {
      await createPayment.mutateAsync({
        invoiceId: form.invoiceId,
        studentId: form.studentId,
        amount: BigInt(Math.round(Number(form.amount))),
        paymentDate: BigInt(new Date(form.paymentDate).getTime()),
        method: form.method,
        notes: form.notes,
      });
      toast.success("Payment recorded successfully");
      setForm(defaultForm);
      setOpen(false);
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const todayCollected = (payments as any[])
    .filter((p: any) => {
      const d = new Date(Number(p.paymentDate));
      const today = new Date();
      return d.toDateString() === today.toDateString();
    })
    .reduce((acc: number, p: any) => acc + Number(p.amount), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Payments"
        description="Record and track fee payments from students"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-ocid="payments.open_modal_button" className="gap-2">
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
                <div className="space-y-1.5">
                  <Label>Invoice *</Label>
                  <Select
                    value={form.invoiceId}
                    onValueChange={handleInvoiceSelect}
                  >
                    <SelectTrigger data-ocid="payments.select">
                      <SelectValue placeholder="Select invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {(invoices as any[])
                        .filter((i: any) => i.status !== "paid")
                        .map((inv: any) => (
                          <SelectItem key={inv.id} value={inv.id}>
                            {invoiceLabel(inv.id)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Amount (₹) *</Label>
                    <Input
                      data-ocid="payments.input"
                      type="number"
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
                        setForm((p) => ({ ...p, paymentDate: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Payment Method *</Label>
                  <Select
                    value={form.method}
                    onValueChange={(v) => setForm((p) => ({ ...p, method: v }))}
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
                  Record Payment
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
              <TableHead>Student</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12"
                  data-ocid="payments.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (payments as any[]).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="payments.empty_state"
                >
                  No payments recorded yet
                </TableCell>
              </TableRow>
            ) : (
              (payments as any[]).map((payment: any, i: number) => (
                <TableRow key={payment.id} data-ocid={`payments.item.${i + 1}`}>
                  <TableCell className="font-medium">
                    {studentName(payment.studentId)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {payment.invoiceId.slice(0, 8)}...
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
