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
import type { Teacher } from "../backend.d";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "../components/shared";
import {
  useAllTeachers,
  useCreateTeacher,
  useDeleteTeacher,
  useUpdateTeacher,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

type TeacherForm = {
  firstName: string;
  lastName: string;
  subjects: string;
  contactEmail: string;
  contactPhone: string;
  dateOfJoin: string;
  isActive: boolean;
};

const emptyForm: TeacherForm = {
  firstName: "",
  lastName: "",
  subjects: "",
  contactEmail: "",
  contactPhone: "",
  dateOfJoin: new Date().toISOString().split("T")[0],
  isActive: true,
};

export default function TeachersPage() {
  const { data: teachers, isLoading } = useAllTeachers();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (teachers ?? []).filter(
    (t) =>
      `${t.firstName} ${t.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      t.contactEmail.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditTeacher(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    const date = new Date(Number(t.dateOfJoin / BigInt(1_000_000)));
    setForm({
      firstName: t.firstName,
      lastName: t.lastName,
      subjects: t.subjects.join(", "),
      contactEmail: t.contactEmail,
      contactPhone: t.contactPhone,
      dateOfJoin: date.toISOString().split("T")[0],
      isActive: t.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      subjects: form.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      dateOfJoin: dateToBigInt(new Date(form.dateOfJoin)),
      isActive: form.isActive,
    };
    try {
      if (editTeacher) {
        await updateTeacher.mutateAsync({ id: editTeacher.id, ...data });
        toast.success("Teacher updated");
      } else {
        await createTeacher.mutateAsync(data);
        toast.success("Teacher created");
      }
      setModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTeacher.mutateAsync(deleteId);
      toast.success("Teacher deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const isPending = createTeacher.isPending || updateTeacher.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teachers"
        description="Manage teaching staff records"
        actions={
          <Button data-ocid="teachers.add.primary_button" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Teacher
          </Button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="teachers.search_input"
          placeholder="Search teachers..."
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
              <TableHead>Subjects</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              ["s1", "s2", "s3", "s4", "s5"].slice(0, 5).map((sk) => (
                <TableRow key={sk}>
                  {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"]
                    .slice(0, 7)
                    .map((ck) => (
                      <TableCell key={ck}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="No teachers found"
                    description={
                      search
                        ? "Try a different search"
                        : "Add your first teacher"
                    }
                    ocid="teachers.list.empty_state"
                    action={
                      !search && (
                        <Button size="sm" onClick={openCreate}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Teacher
                        </Button>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t, i) => (
                <TableRow
                  key={t.id}
                  data-ocid={`teachers.list.item.${i + 1}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium">
                    {t.firstName} {t.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.subjects.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                      {t.subjects.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{t.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.contactEmail}
                  </TableCell>
                  <TableCell>{t.contactPhone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {bigIntToDateString(t.dateOfJoin)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={t.isActive ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-ocid={`teachers.list.edit_button.${i + 1}`}
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`teachers.list.delete_button.${i + 1}`}
                        onClick={() => setDeleteId(t.id)}
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
        <DialogContent data-ocid="teachers.modal" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTeacher ? "Edit Teacher" : "Add New Teacher"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  data-ocid="teachers.modal.firstname.input"
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
                  data-ocid="teachers.modal.lastname.input"
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subjects (comma-separated)</Label>
              <Input
                data-ocid="teachers.modal.subjects.input"
                placeholder="e.g. Math, Science, English"
                value={form.subjects}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subjects: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                data-ocid="teachers.modal.email.input"
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  data-ocid="teachers.modal.phone.input"
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactPhone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Join</Label>
                <Input
                  data-ocid="teachers.modal.joindate.input"
                  type="date"
                  value={form.dateOfJoin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dateOfJoin: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="teachers.modal.active.switch"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label>Active Teacher</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="teachers.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="teachers.modal.submit_button"
                type="submit"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editTeacher ? "Update" : "Create"} Teacher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher?"
        onConfirm={handleDelete}
        isLoading={deleteTeacher.isPending}
      />
    </div>
  );
}
