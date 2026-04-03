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
import type { Student } from "../backend.d";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "../components/shared";
import {
  useAllStudents,
  useCreateStudent,
  useDeleteStudent,
  useUpdateStudent,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

type StudentForm = {
  firstName: string;
  lastName: string;
  grade: string;
  contactEmail: string;
  contactPhone: string;
  parentName: string;
  enrollmentDate: string;
  isActive: boolean;
};

const emptyForm: StudentForm = {
  firstName: "",
  lastName: "",
  grade: "",
  contactEmail: "",
  contactPhone: "",
  parentName: "",
  enrollmentDate: new Date().toISOString().split("T")[0],
  isActive: true,
};

export default function StudentsPage() {
  const { data: students, isLoading } = useAllStudents();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = (students ?? []).filter(
    (s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.contactEmail.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditStudent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    const date = new Date(Number(s.enrollmentDate / BigInt(1_000_000)));
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      grade: String(Number(s.grade)),
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      parentName: s.parentName,
      enrollmentDate: date.toISOString().split("T")[0],
      isActive: s.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      grade: BigInt(Number.parseInt(form.grade) || 0),
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      parentName: form.parentName,
      enrollmentDate: dateToBigInt(new Date(form.enrollmentDate)),
      isActive: form.isActive,
    };
    try {
      if (editStudent) {
        await updateStudent.mutateAsync({ id: editStudent.id, ...data });
        toast.success("Student updated successfully");
      } else {
        await createStudent.mutateAsync(data);
        toast.success("Student created successfully");
      }
      setModalOpen(false);
    } catch {
      toast.error("Operation failed. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent.mutateAsync(deleteId);
      toast.success("Student deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const isPending = createStudent.isPending || updateStudent.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Students"
        description="Manage student enrollment and records"
        actions={
          <Button data-ocid="students.add.primary_button" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="students.search_input"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Enrolled</TableHead>
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
                    title="No students found"
                    description={
                      search
                        ? "Try a different search term"
                        : "Add your first student to get started"
                    }
                    ocid="students.list.empty_state"
                    action={
                      !search && (
                        <Button size="sm" onClick={openCreate}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Student
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
                  data-ocid={`students.list.item.${i + 1}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium">
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>Grade {Number(s.grade)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.contactEmail}
                  </TableCell>
                  <TableCell>{s.parentName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {bigIntToDateString(s.enrollmentDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.isActive ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        data-ocid={`students.list.edit_button.${i + 1}`}
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`students.list.delete_button.${i + 1}`}
                        onClick={() => setDeleteId(s.id)}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
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

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="students.modal" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  data-ocid="students.modal.firstname.input"
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
                  data-ocid="students.modal.lastname.input"
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade *</Label>
                <Input
                  data-ocid="students.modal.grade.input"
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={form.grade}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, grade: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Enrollment Date</Label>
                <Input
                  data-ocid="students.modal.enrollmentdate.input"
                  type="date"
                  value={form.enrollmentDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, enrollmentDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                data-ocid="students.modal.email.input"
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactEmail: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                data-ocid="students.modal.phone.input"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Name</Label>
              <Input
                data-ocid="students.modal.parentname.input"
                value={form.parentName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parentName: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="students.modal.active.switch"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label>Active Student</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="students.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="students.modal.submit_button"
                type="submit"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editStudent ? "Update" : "Create"} Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteStudent.isPending}
      />
    </div>
  );
}
