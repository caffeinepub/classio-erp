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
  Edit2,
  IndianRupee,
  Loader2,
  Plus,
  Trash2,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import {
  useAllExpenses,
  useCreateExpense,
  useDeleteExpense,
  useTotalExpenses,
  useUpdateExpense,
} from "../hooks/useQueries";
import { formatINR } from "../utils/currencyUtils";
import { bigIntToDateString } from "../utils/dateUtils";

const EXPENSE_CATEGORIES = [
  "Salaries",
  "Infrastructure",
  "Utilities",
  "Supplies & Stationery",
  "Maintenance",
  "Technology",
  "Events & Activities",
  "Transport",
  "Food & Canteen",
  "Library",
  "Sports & PE",
  "Miscellaneous",
];

const defaultForm = {
  category: "",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  approvedBy: "",
};

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useAllExpenses();
  const { data: totalExpenses = BigInt(0) } = useTotalExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered =
    filterCategory === "all"
      ? expenses
      : (expenses as any[]).filter((e: any) => e.category === filterCategory);

  const handleOpen = (exp?: any) => {
    if (exp) {
      setEditId(exp.id);
      setForm({
        category: exp.category,
        description: exp.description,
        amount: String(Number(exp.amount)),
        date: new Date(Number(exp.date)).toISOString().split("T")[0],
        approvedBy: exp.approvedBy,
      });
    } else {
      setEditId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.category || !form.description || !form.amount) {
      toast.error("Category, description, and amount are required");
      return;
    }
    const payload = {
      category: form.category,
      description: form.description,
      amount: BigInt(Math.round(Number(form.amount))),
      date: BigInt(new Date(form.date).getTime()),
      approvedBy: form.approvedBy,
    };
    try {
      if (editId) {
        await updateExpense.mutateAsync({ id: editId, ...payload });
        toast.success("Expense updated");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Expense recorded");
      }
      setOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error("Failed to save expense");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const isPending = createExpense.isPending || updateExpense.isPending;

  // Category breakdown
  const categoryTotals = (expenses as any[]).reduce(
    (acc: Record<string, number>, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    },
    {},
  );
  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Expense Management"
        description="Track and manage school operational expenses"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="expenses.open_modal_button"
                onClick={() => handleOpen()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" data-ocid="expenses.dialog">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit" : "Add"} Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, category: v }))
                    }
                  >
                    <SelectTrigger data-ocid="expenses.select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Description *</Label>
                  <Textarea
                    data-ocid="expenses.textarea"
                    placeholder="Brief description of expense..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Amount (₹) *</Label>
                    <Input
                      data-ocid="expenses.input"
                      type="number"
                      placeholder="15000"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, date: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Approved By</Label>
                  <Input
                    placeholder="Principal / Admin Name"
                    value={form.approvedBy}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, approvedBy: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  data-ocid="expenses.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="expenses.submit_button"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editId ? "Update" : "Add Expense"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {formatINR(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-warning" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {topCategory ? topCategory[0] : "—"}
            </p>
            {topCategory && (
              <p className="text-sm text-muted-foreground">
                {formatINR(topCategory[1])}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-card border-l-4 border-l-muted-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              # Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(expenses as any[]).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category filter */}
      <div
        className="flex gap-2 mb-4 flex-wrap"
        data-ocid="expenses.filter.tab"
      >
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("all")}
        >
          All
        </Button>
        {EXPENSE_CATEGORIES.slice(0, 6).map((c) => (
          <Button
            key={c}
            variant={filterCategory === c ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card">
        <Table data-ocid="expenses.table">
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12"
                  data-ocid="expenses.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (filtered as any[]).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="expenses.empty_state"
                >
                  No expenses recorded
                </TableCell>
              </TableRow>
            ) : (
              (filtered as any[]).map((expense: any, i: number) => (
                <TableRow key={expense.id} data-ocid={`expenses.item.${i + 1}`}>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      <TrendingDown className="h-3 w-3 text-destructive" />
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="font-semibold text-destructive">
                    {formatINR(expense.amount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {bigIntToDateString(expense.date)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {expense.approvedBy || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`expenses.edit_button.${i + 1}`}
                        onClick={() => handleOpen(expense)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Dialog
                        open={deleteId === expense.id}
                        onOpenChange={(o) => !o && setDeleteId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`expenses.delete_button.${i + 1}`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(expense.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent data-ocid="expenses.dialog">
                          <DialogHeader>
                            <DialogTitle>Delete Expense</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete this expense record?
                            This cannot be undone.
                          </p>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              data-ocid="expenses.cancel_button"
                              onClick={() => setDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              data-ocid="expenses.confirm_button"
                              onClick={() => handleDelete(expense.id)}
                              disabled={deleteExpense.isPending}
                            >
                              {deleteExpense.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
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
