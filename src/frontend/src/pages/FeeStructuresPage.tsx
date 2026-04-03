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

type ConsolidatedFees = {
  tuition: number;
  activity: number;
  term: number;
  total: number;
};

function parseFeeDescription(
  description: string,
  fallbackAmount: bigint,
): ConsolidatedFees {
  try {
    const parsed = JSON.parse(description);
    if (typeof parsed === "object" && parsed !== null && "tuition" in parsed) {
      return {
        tuition: Number(parsed.tuition) || 0,
        activity: Number(parsed.activity) || 0,
        term: Number(parsed.term) || 0,
        total: Number(parsed.total) || Number(fallbackAmount),
      };
    }
  } catch {
    // not JSON, treat as plain description
  }
  return { tuition: 0, activity: 0, term: 0, total: Number(fallbackAmount) };
}

type FeeForm = {
  gradeLevel: string;
  academicYear: string;
  tuition: string;
  activity: string;
  term: string;
  total: string;
  isActive: boolean;
};

const currentYear = new Date().getFullYear();
const defaultForm: FeeForm = {
  gradeLevel: "",
  academicYear: `${currentYear}-${currentYear + 1}`,
  tuition: "",
  activity: "",
  term: "",
  total: "",
  isActive: true,
};

function recalcTotal(f: FeeForm): string {
  const t = Number(f.tuition) || 0;
  const a = Number(f.activity) || 0;
  const te = Number(f.term) || 0;
  return String(t + a + te);
}

export default function FeeStructuresPage() {
  const { data: feeStructures = [], isLoading } = useAllFeeStructures();
  const createFS = useCreateFeeStructure();
  const updateFS = useUpdateFeeStructure();
  const deleteFS = useDeleteFeeStructure();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FeeForm>(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleOpen = (fs?: any) => {
    if (fs) {
      setEditId(fs.id);
      const fees = parseFeeDescription(fs.description, fs.amount);
      setForm({
        gradeLevel: fs.gradeLevel || "",
        academicYear: fs.academicYear || `${currentYear}-${currentYear + 1}`,
        tuition: fees.tuition > 0 ? String(fees.tuition) : "",
        activity: fees.activity > 0 ? String(fees.activity) : "",
        term: fees.term > 0 ? String(fees.term) : "",
        total: String(fees.total),
        isActive: fs.isActive,
      });
    } else {
      setEditId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleFeeChange = (
    field: "tuition" | "activity" | "term" | "total",
    value: string,
  ) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field !== "total") {
        updated.total = recalcTotal(updated);
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!form.gradeLevel) {
      toast.error("Grade level is required");
      return;
    }
    const tuitionVal = Number(form.tuition) || 0;
    if (tuitionVal <= 0) {
      toast.error("Tuition fees must be greater than 0");
      return;
    }
    const activityVal = Number(form.activity) || 0;
    const termVal = Number(form.term) || 0;
    const totalVal = Number(form.total) || tuitionVal + activityVal + termVal;

    const feesJson: ConsolidatedFees = {
      tuition: tuitionVal,
      activity: activityVal,
      term: termVal,
      total: totalVal,
    };

    const name = `${form.gradeLevel} Fee Structure ${form.academicYear}`;
    const payload = {
      name,
      description: JSON.stringify(feesJson),
      amount: BigInt(Math.round(totalVal)),
      gradeLevel: form.gradeLevel,
      academicYear: form.academicYear,
      feeType: "consolidated",
      feeTypeLabel: "Consolidated Fee Structure",
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
        description="Define consolidated fee structures per grade. All components set once and synced across students."
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
                <div className="grid grid-cols-2 gap-4">
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

                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Fee Components (₹)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Tuition Fees (₹) *</Label>
                      <Input
                        data-ocid="fee_structures.tuition.input"
                        type="number"
                        placeholder="50000"
                        value={form.tuition}
                        onChange={(e) =>
                          handleFeeChange("tuition", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Activity Fees (₹)</Label>
                      <Input
                        data-ocid="fee_structures.activity.input"
                        type="number"
                        placeholder="5000"
                        value={form.activity}
                        onChange={(e) =>
                          handleFeeChange("activity", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Term Fees (₹)</Label>
                      <Input
                        data-ocid="fee_structures.term.input"
                        type="number"
                        placeholder="15000"
                        value={form.term}
                        onChange={(e) =>
                          handleFeeChange("term", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-semibold text-primary">
                        Total Fees (₹)
                      </Label>
                      <Input
                        data-ocid="fee_structures.total.input"
                        type="number"
                        placeholder="70000"
                        value={form.total}
                        onChange={(e) =>
                          handleFeeChange("total", e.target.value)
                        }
                        className="font-semibold border-primary/40 focus-visible:ring-primary/40"
                      />
                      <p className="text-xs text-muted-foreground">
                        Auto-calculated, but can be overridden
                      </p>
                    </div>
                  </div>
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

      <div className="rounded-lg border border-border bg-card shadow-card overflow-x-auto">
        <Table data-ocid="fee_structures.table">
          <TableHeader>
            <TableRow>
              <TableHead>Grade Level</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Tuition Fees</TableHead>
              <TableHead>Activity Fees</TableHead>
              <TableHead>Term Fees</TableHead>
              <TableHead>Total Fees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12"
                  data-ocid="fee_structures.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : (feeStructures as any[]).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="fee_structures.empty_state"
                >
                  No fee structures yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              (feeStructures as any[]).map((fs: any, i: number) => {
                const fees = parseFeeDescription(fs.description, fs.amount);
                return (
                  <TableRow
                    key={fs.id}
                    data-ocid={`fee_structures.item.${i + 1}`}
                  >
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {fs.gradeLevel || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fs.academicYear || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {fees.tuition > 0 ? (
                        formatINR(fees.tuition)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {fees.activity > 0 ? (
                        formatINR(fees.activity)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {fees.term > 0 ? (
                        formatINR(fees.term)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-success">
                      {formatINR(fees.total || fs.amount)}
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
                              Are you sure you want to delete the fee structure
                              for <strong>{fs.gradeLevel}</strong>? This cannot
                              be undone.
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
