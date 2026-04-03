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
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Course } from "../backend.d";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "../components/shared";
import {
  useAddOrUpdateCourse,
  useAllClasses,
  useAllCourses,
  useAllTeachers,
  useDeleteCourse,
} from "../hooks/useQueries";

type CourseForm = {
  title: string;
  description: string;
  teacherId: string;
  classId: string;
  subject: string;
  isActive: boolean;
};

const emptyForm: CourseForm = {
  title: "",
  description: "",
  teacherId: "",
  classId: "",
  subject: "",
  isActive: true,
};

export default function CoursesPage({
  onCourseDetail,
}: {
  onCourseDetail: (courseId: string) => void;
}) {
  const { data: courses, isLoading } = useAllCourses();
  const { data: teachers } = useAllTeachers();
  const { data: classes } = useAllClasses();
  const upsertCourse = useAddOrUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [modalOpen, setModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditCourse(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    setForm({
      title: c.title,
      description: c.description,
      teacherId: c.teacherId,
      classId: c.classId,
      subject: c.subject,
      isActive: c.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertCourse.mutateAsync(form);
      toast.success(editCourse ? "Course updated" : "Course created");
      setModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCourse.mutateAsync(deleteId);
      toast.success("Course deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  const getTeacherName = (id: string) => {
    const t = teachers?.find((t) => t.id === id);
    return t ? `${t.firstName} ${t.lastName}` : "Unassigned";
  };

  const getClassName = (id: string) =>
    classes?.find((c) => c.id === id)?.name ?? "—";

  const subjectColors = [
    "bg-blue-50 border-blue-200 text-blue-700",
    "bg-green-50 border-green-200 text-green-700",
    "bg-purple-50 border-purple-200 text-purple-700",
    "bg-orange-50 border-orange-200 text-orange-700",
    "bg-teal-50 border-teal-200 text-teal-700",
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="LMS Courses"
        description="Manage learning management system courses"
        actions={
          <Button data-ocid="courses.add.primary_button" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Course
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
            <Skeleton key={k} className="h-48" />
          ))}
        </div>
      ) : !courses || courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create your first LMS course"
          ocid="courses.list.empty_state"
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <div
              key={c.id}
              data-ocid={`courses.list.item.${i + 1}`}
              className="bg-card border border-border rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`border rounded-lg px-2.5 py-1 text-xs font-medium ${subjectColors[i % subjectColors.length]}`}
                >
                  {c.subject}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    data-ocid={`courses.list.edit_button.${i + 1}`}
                    onClick={() => openEdit(c)}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`courses.list.delete_button.${i + 1}`}
                    onClick={() => setDeleteId(c.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {c.description}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Teacher: {getTeacherName(c.teacherId)}</p>
                <p>Class: {getClassName(c.classId)}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <StatusBadge status={c.isActive ? "active" : "inactive"} />
                <button
                  type="button"
                  data-ocid={`courses.detail.open_modal_button.${i + 1}`}
                  onClick={() => onCourseDetail(c.id)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View Content <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="courses.modal" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editCourse ? "Edit Course" : "Add Course"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                data-ocid="courses.modal.title.input"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                data-ocid="courses.modal.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select
                  value={form.teacherId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, teacherId: v }))
                  }
                >
                  <SelectTrigger data-ocid="courses.modal.teacher.select">
                    <SelectValue placeholder="Select" />
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
                <Label>Class</Label>
                <Select
                  value={form.classId}
                  onValueChange={(v) => setForm((f) => ({ ...f, classId: v }))}
                >
                  <SelectTrigger data-ocid="courses.modal.class.select">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                data-ocid="courses.modal.subject.input"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="e.g. Mathematics"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                data-ocid="courses.modal.active.switch"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Label>Active Course</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="courses.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="courses.modal.submit_button"
                type="submit"
                disabled={upsertCourse.isPending}
              >
                {upsertCourse.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editCourse ? "Update" : "Create"} Course
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Course"
        description="Are you sure you want to delete this course? All lessons and assignments will be lost."
        onConfirm={handleDelete}
        isLoading={deleteCourse.isPending}
      />
    </div>
  );
}
