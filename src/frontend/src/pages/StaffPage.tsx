import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Staff } from "../backend.d";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "../components/shared";
import {
  useAllDepartments,
  useAllStaff,
  useCreateStaff,
  useDeleteStaff,
  useUpdateStaff,
} from "../hooks/useQueries";
import {
  bigIntToDateString,
  dateToBigInt,
  formatCurrency,
} from "../utils/dateUtils";

type StaffForm = {
  firstName: string;
  lastName: string;
  position: string;
  departmentId: string;
  employmentType: string;
  salary: string;
  contactEmail: string;
  contactPhone: string;
  hireDate: string;
  isActive: boolean;
};

const emptyForm: StaffForm = {
  firstName: "",
  lastName: "",
  position: "",
  departmentId: "",
  employmentType: "fullTime",
  salary: "",
  contactEmail: "",
  contactPhone: "",
  hireDate: new Date().toISOString().split("T")[0],
  isActive: true,
};

export default function StaffPage() {
  const { data: staff, isLoading } = useAllStaff();
  const { data: departments } = useAllDepartments();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (staff ?? []).filter(
    (s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.position.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditStaff(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: Staff) => {
    setEditStaff(s);
    const date = new Date(Number(s.hireDate / BigInt(1_000_000)));
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      position: s.position,
      departmentId: s.departmentId,
      employmentType: s.employmentType,
      salary: String(Number(s.salary)),
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      hireDate: date.toISOString().split("T")[0],
      isActive: s.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      position: form.position,
      departmentId: form.departmentId,
      employmentType: form.employmentType,
      salary: BigInt(Number.parseInt(form.salary) || 0),
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      hireDate: dateToBigInt(new Date(form.hireDate)),
      isActive: form.isActive,
    };
    try {
      if (editStaff) {
        await updateStaff.mutateAsync({ id: editStaff.id, ...data });
        toast.success("Staff updated");
      } else {
        await createStaff.mutateAsync(data);
        toast.success("Staff member created");
      }
      setModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStaff.mutateAsync(deleteId);
      toast.success("Staff deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const getDeptName = (id: string) =>
    departments?.find((d) => d.id === id)?.name ?? id;
  const isPending = createStaff.isPending || updateStaff.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Staff Management"
        description="Manage human resources and employee records"
        actions={
          <Button data-ocid="staff.add.primary_button" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Staff
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="staff.search_input"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["s1", "s2", "s3", "s4", "s5"].slice(0, 5).map((sk) => (
                <TableRow key={sk}>
                  {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"]
                    .slice(0, 8)
                    .map((ck) => (
                      <TableCell key={ck}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState
                    title="No staff found"
                    description={
                      search
                        ? "Try different keywords"
                        : "Add your first staff member"
                    }
                    ocid="staff.list.empty_state"
                    action={
                      !search && (
                        <Button size="sm" onClick={openCreate}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Staff
                        </Button>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s, i) => (
                <TableRow
                  key={s.id}
                  data-ocid={`staff.list.item.${i + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium">
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>{s.position}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getDeptName(s.departmentId)}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-sm">
                      {s.employmentType === "fullTime"
                        ? "Full Time"
                        : s.employmentType === "partTime"
                          ? "Part Time"
                          : "Contract"}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(s.salary)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {bigIntToDateString(s.hireDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.isActive ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-ocid={`staff.list.edit_button.${i + 1}`}
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`staff.list.delete_button.${i + 1}`}
                        onClick={() => setDeleteId(s.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="staff.modal" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editStaff ? "Edit Staff" : "Add Staff Member"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  data-ocid="staff.modal.firstname.input"
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  data-ocid="staff.modal.lastname.input"
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Position *</Label>
              <Input
                data-ocid="staff.modal.position.input"
                required
                value={form.position}
                onChange={(e) =>
                  setForm((f) => ({ ...f, position: e.target.value }))
                }
                placeholder="e.g. Librarian"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, departmentId: v }))
                  }
                >
                  <SelectTrigger data-ocid="staff.modal.department.select">
                    <SelectValue placeholder="Select dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {(departments ?? []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select
                  value={form.employmentType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, employmentType: v }))
                  }
                >
                  <SelectTrigger data-ocid="staff.modal.emptype.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fullTime">Full Time</SelectItem>
                    <SelectItem value="partTime">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary (USD)</Label>
                <Input
                  data-ocid="staff.modal.salary.input"
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hire Date</Label>
                <Input
                  data-ocid="staff.modal.hiredate.input"
                  type="date"
                  value={form.hireDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hireDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                data-ocid="staff.modal.email.input"
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                data-ocid="staff.modal.phone.input"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="staff.modal.active.switch"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="staff.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="staff.modal.submit_button"
                type="submit"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editStaff ? "Update" : "Add"} Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Staff"
        description="Are you sure you want to delete this staff member?"
        onConfirm={handleDelete}
        isLoading={deleteStaff.isPending}
      />
    </div>
  );
}
