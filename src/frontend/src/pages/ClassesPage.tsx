import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Class } from "../backend.d";
import { ConfirmDialog, EmptyState, PageHeader } from "../components/shared";
import {
  useAllClasses,
  useAllStudents,
  useAllTeachers,
  useCreateClass,
  useDeleteClass,
  useEnrollStudent,
  useRemoveStudentFromClass,
  useUpdateClass,
} from "../hooks/useQueries";

type ClassForm = {
  name: string;
  teacherId: string;
  subjects: string;
};

const emptyForm: ClassForm = { name: "", teacherId: "", subjects: "" };

export default function ClassesPage() {
  const { data: classes, isLoading } = useAllClasses();
  const { data: teachers } = useAllTeachers();
  const { data: students } = useAllStudents();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const enrollStudent = useEnrollStudent();
  const removeStudent = useRemoveStudentFromClass();

  const [modalOpen, setModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [form, setForm] = useState<ClassForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailClass, setDetailClass] = useState<Class | null>(null);
  const [enrollStudentId, setEnrollStudentId] = useState("");

  const openCreate = () => {
    setEditClass(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: Class) => {
    setEditClass(c);
    setForm({
      name: c.name,
      teacherId: c.teacherId,
      subjects: c.subjects.join(", "),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      teacherId: form.teacherId,
      subjects: form.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editClass) {
        await updateClass.mutateAsync({ id: editClass.id, ...data });
        toast.success("Class updated");
      } else {
        await createClass.mutateAsync(data);
        toast.success("Class created");
      }
      setModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClass.mutateAsync(deleteId);
      toast.success("Class deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEnroll = async () => {
    if (!detailClass || !enrollStudentId) return;
    try {
      await enrollStudent.mutateAsync({
        classId: detailClass.id,
        studentId: enrollStudentId,
      });
      toast.success("Student enrolled");
      setEnrollStudentId("");
    } catch {
      toast.error("Enrollment failed");
    }
  };

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    try {
      await removeStudent.mutateAsync({ classId, studentId });
      toast.success("Student removed");
    } catch {
      toast.error("Remove failed");
    }
  };

  const getTeacherName = (id: string) => {
    const t = teachers?.find((t) => t.id === id);
    return t ? `${t.firstName} ${t.lastName}` : "Unknown";
  };

  const isPending = createClass.isPending || updateClass.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Classes"
        description="Manage class sections and enrollments"
        actions={
          <Button data-ocid="classes.add.primary_button" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Class
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
            <Skeleton key={k} className="h-40" />
          ))}
        </div>
      ) : !classes || classes.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Create your first class to get started"
          ocid="classes.list.empty_state"
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c, i) => (
            <Card
              key={c.id}
              data-ocid={`classes.list.item.${i + 1}`}
              className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      data-ocid={`classes.list.edit_button.${i + 1}`}
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`classes.list.delete_button.${i + 1}`}
                      onClick={() => setDeleteId(c.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Teacher: {getTeacherName(c.teacherId)}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.subjects.map((s) => (
                    <span
                      key={s}
                      className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  data-ocid={`classes.detail.open_modal_button.${i + 1}`}
                  onClick={() => setDetailClass(c)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Users className="h-3 w-3" />
                  Manage Students
                  <ChevronRight className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="classes.modal">
          <DialogHeader>
            <DialogTitle>
              {editClass ? "Edit Class" : "Add New Class"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Class Name *</Label>
              <Input
                data-ocid="classes.modal.name.input"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Grade 10A"
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Teacher</Label>
              <Select
                value={form.teacherId}
                onValueChange={(v) => setForm((f) => ({ ...f, teacherId: v }))}
              >
                <SelectTrigger data-ocid="classes.modal.teacher.select">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {(teachers ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subjects (comma-separated)</Label>
              <Input
                data-ocid="classes.modal.subjects.input"
                placeholder="e.g. Math, English, Science"
                value={form.subjects}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subjects: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="classes.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="classes.modal.submit_button"
                type="submit"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editClass ? "Update" : "Create"} Class
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Class Detail (enrolled students) */}
      <Dialog
        open={!!detailClass}
        onOpenChange={(o) => !o && setDetailClass(null)}
      >
        <DialogContent data-ocid="classes.detail.modal" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailClass?.name} — Students</DialogTitle>
          </DialogHeader>
          {detailClass && (
            <div className="space-y-4">
              {/* Enroll */}
              <div className="flex gap-2">
                <Select
                  value={enrollStudentId}
                  onValueChange={setEnrollStudentId}
                >
                  <SelectTrigger
                    data-ocid="classes.detail.student.select"
                    className="flex-1"
                  >
                    <SelectValue placeholder="Select student to enroll" />
                  </SelectTrigger>
                  <SelectContent>
                    {(students ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  data-ocid="classes.detail.enroll.primary_button"
                  onClick={handleEnroll}
                  disabled={!enrollStudentId || enrollStudent.isPending}
                >
                  {enrollStudent.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enroll"
                  )}
                </Button>
              </div>

              {/* Current students - show all students who match class (simplified) */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(students ?? [])
                  .filter((s) => s.isActive)
                  .slice(0, 8)
                  .map((s, i) => (
                    <div
                      key={s.id}
                      data-ocid={`classes.detail.student.item.${i + 1}`}
                      className="flex items-center justify-between p-2 rounded-md border border-border"
                    >
                      <span className="text-sm">
                        {s.firstName} {s.lastName}
                      </span>
                      <button
                        type="button"
                        data-ocid={`classes.detail.remove.delete_button.${i + 1}`}
                        onClick={() =>
                          handleRemoveStudent(detailClass.id, s.id)
                        }
                        className="text-muted-foreground hover:text-destructive p-1 rounded"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              data-ocid="classes.detail.close_button"
              variant="outline"
              onClick={() => setDetailClass(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Class"
        description="Are you sure you want to delete this class?"
        onConfirm={handleDelete}
        isLoading={deleteClass.isPending}
      />
    </div>
  );
}
