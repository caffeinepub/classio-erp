import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import {
  useAllFeeStructures,
  useAllStudentInvoices,
  useAllStudents,
  useCreateStudentInvoice,
  useUpdateStudentInvoice,
} from "../hooks/useQueries";
import { formatINR } from "../utils/currencyUtils";
import { bigIntToDateString } from "../utils/dateUtils";

type InvoiceStatus = "unpaid" | "paid" | "overdue";

const statusColors: Record<InvoiceStatus, string> = {
  unpaid: "bg-warning/20 text-warning border-warning/30",
  paid: "bg-success/20 text-success border-success/30",
  overdue: "bg-destructive/20 text-destructive border-destructive/30",
};

const defaultForm = {
  studentId: "",
  feeStructureId: "",
  amount: "",
  dueDate: "",
  status: "unpaid",
};

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useAllStudentInvoices();
  const { data: students = [] } = useAllStudents();
  const { data: feeStructures = [] } = useAllFeeStructures();
  const createInvoice = useCreateStudentInvoice();
  const updateInvoice = useUpdateStudentInvoice();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [form, setForm] = useState(defaultForm);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered =
    filterStatus === "all"
      ? invoices
      : invoices.filter((inv: any) => inv.status === filterStatus);

  const studentName = (id: string) => {
    const s = (students as any[]).find((s: any) => s.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  const feeName = (id: string) => {
    const f = (feeStructures as any[]).find((f: any) => f.id === id);
    return f ? f.name : id;
  };

  const handleOpen = (inv?: any) => {
    if (inv) {
      setEditData(inv);
      setForm({
        studentId: inv.studentId,
        feeStructureId: inv.feeStructureId,
        amount: String(Number(inv.amount)),
        dueDate: new Date(Number(inv.dueDate)).toISOString().split("T")[0],
        status: inv.status,
      });
    } else {
      setEditData(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleFeeStructureSelect = (id: string) => {
    const fs = (feeStructures as any[]).find((f: any) => f.id === id);
    setForm((p) => ({
      ...p,
      feeStructureId: id,
      amount: fs ? String(Number(fs.amount)) : p.amount,
    }));
  };

  const handleSubmit = async () => {
    if (
      !form.studentId ||
      !form.feeStructureId ||
      !form.amount ||
      !form.dueDate
    ) {
      toast.error("All fields are required");
      return;
    }
    const now = BigInt(Date.now());
    const payload = {
      studentId: form.studentId,
      feeStructureId: form.feeStructureId,
      amount: BigInt(Math.round(Number(form.amount))),
      dueDate: BigInt(new Date(form.dueDate).getTime()),
      status: form.status,
      issuedDate: now,
    };
    try {
      if (editData) {
        await updateInvoice.mutateAsync({ id: editData.id, ...payload });
        toast.success("Invoice updated");
      } else {
        await createInvoice.mutateAsync(payload);
        toast.success("Invoice generated");
      }
      setOpen(false);
    } catch {
      toast.error("Failed to save invoice");
    }
  };

  const isPending = createInvoice.isPending || updateInvoice.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Student Invoices"
        description="Generate and manage fee invoices for students"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="invoices.open_modal_button"
                onClick={() => handleOpen()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Generate Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" data-ocid="invoices.dialog">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {editData ? "Edit Invoice" : "Generate Invoice"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Student *</Label>
                  <Select
                    value={form.studentId}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, studentId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="invoices.select">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {(students as any[]).map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Fee Structure *</Label>
                  <Select
                    value={form.feeStructureId}
                    onValueChange={handleFeeStructureSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {(feeStructures as any[]).map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} — {formatINR(f.amount)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Amount (₹) *</Label>
                    <Input
                      data-ocid="invoices.input"
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due Date *</Label>
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, dueDate: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  data-ocid="invoices.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="invoices.submit_button"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editData ? "Update" : "Generate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter */}
      <div className="flex gap-2 mb-4" data-ocid="invoices.filter.tab">
        {["all", "unpaid", "paid", "overdue"].map((s) => (
          <Button
            key={s}
            variant={filterStatus === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card">
        <Table data-ocid="invoices.table">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Fee Structure</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Issued Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12"
                  data-ocid="invoices.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="invoices.empty_state"
                >
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv: any, i: number) => (
                <TableRow key={inv.id} data-ocid={`invoices.item.${i + 1}`}>
                  <TableCell className="font-medium">
                    {studentName(inv.studentId)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {feeName(inv.feeStructureId)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatINR(inv.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {bigIntToDateString(inv.issuedDate)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {bigIntToDateString(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        statusColors[(inv.status as InvoiceStatus) ?? "unpaid"]
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      data-ocid={`invoices.edit_button.${i + 1}`}
                      onClick={() => handleOpen(inv)}
                    >
                      Edit
                    </Button>
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
