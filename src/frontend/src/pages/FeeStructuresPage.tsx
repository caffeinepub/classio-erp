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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import {
  useAllFeeStructures,
  useCreateFeeStructure,
  useDeleteFeeStructure,
  useUpdateFeeStructure,
} from "../hooks/useQueries";
import { formatINR } from "../utils/currencyUtils";

const GRADE_LEVELS = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "All Grades",
];

const defaultForm = {
  name: "",
  description: "",
  amount: "",
  gradeLevel: "",
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  isActive: true,
};

export default function FeeStructuresPage() {
  const { data: feeStructures = [], isLoading } = useAllFeeStructures();
  const createFS = useCreateFeeStructure();
  const updateFS = useUpdateFeeStructure();
  const deleteFS = useDeleteFeeStructure();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpen = (fs?: any) => {
    if (fs) {
      setEditId(fs.id);
      setForm({
        name: fs.name,
        description: fs.description,
        amount: String(Number(fs.amount)),
        gradeLevel: fs.gradeLevel,
        academicYear: fs.academicYear,
        isActive: fs.isActive,
      });
    } else {
      setEditId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.gradeLevel) {
      toast.error("Name, amount, and grade level are required");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      amount: BigInt(Math.round(Number(form.amount))),
      gradeLevel: form.gradeLevel,
      academicYear: form.academicYear,
      isActive: form.isActive,
    };
    try {
      if (editId) {
        await updateFS.mutateAsync({ id: editId, ...payload });
        toast.success("Fee structure updated");
      } else {
        await createFS.mutateAsync(payload);
        toast.success("Fee structure created");
      }
      setOpen(false);
      setForm(defaultForm);
    } catch {
      toast.error("Failed to save fee structure");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFS.mutateAsync(id);
      toast.success("Fee structure deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const isPending = createFS.isPending || updateFS.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Fee Structures"
        description="Manage fee schedules for different grade levels and academic years"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="fee_structures.open_modal_button"
                onClick={() => handleOpen()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-lg"
              data-ocid="fee_structures.dialog"
            >
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Edit" : "Add"} Fee Structure
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input
                    data-ocid="fee_structures.input"
                    placeholder="Annual Tuition Fee"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    data-ocid="fee_structures.textarea"
                    placeholder="Fee description..."
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
                      type="number"
                      placeholder="50000"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Academic Year</Label>
                    <Input
                      placeholder="2025-2026"
                      value={form.academicYear}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, academicYear: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Grade Level *</Label>
                  <Select
                    value={form.gradeLevel}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, gradeLevel: v }))
                    }
                  >
                    <SelectTrigger data-ocid="fee_structures.select">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    data-ocid="fee_structures.switch"
                    checked={form.isActive}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, isActive: v }))
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  data-ocid="fee_structures.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="fee_structures.submit_button"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-lg border border-border bg-card shadow-card">
        <Table data-ocid="fee_structures.table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade Level</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12"
                  data-ocid="fee_structures.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : feeStructures.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="fee_structures.empty_state"
                >
                  No fee structures yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              feeStructures.map((fs: any, i: number) => (
                <TableRow
                  key={fs.id}
                  data-ocid={`fee_structures.item.${i + 1}`}
                >
                  <TableCell>
                    <div className="font-medium">{fs.name}</div>
                    {fs.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {fs.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{fs.gradeLevel}</TableCell>
                  <TableCell>{fs.academicYear}</TableCell>
                  <TableCell className="font-semibold text-success">
                    {formatINR(fs.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        fs.isActive
                          ? "bg-success/10 text-success border-success/30"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {fs.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid={`fee_structures.edit_button.${i + 1}`}
                        onClick={() => handleOpen(fs)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Dialog
                        open={deleteId === fs.id}
                        onOpenChange={(o) => !o && setDeleteId(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-ocid={`fee_structures.delete_button.${i + 1}`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(fs.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent data-ocid="fee_structures.dialog">
                          <DialogHeader>
                            <DialogTitle>Delete Fee Structure</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <strong>{fs.name}</strong>? This cannot be undone.
                          </p>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              data-ocid="fee_structures.cancel_button"
                              onClick={() => setDeleteId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              data-ocid="fee_structures.confirm_button"
                              onClick={() => handleDelete(fs.id)}
                              disabled={deleteFS.isPending}
                            >
                              {deleteFS.isPending ? (
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
