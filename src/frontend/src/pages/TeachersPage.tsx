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
import { Loader2, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Teacher } from "../backend.d";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "../components/shared";
import { useActor } from "../hooks/useActor";
import {
  useAllTeachers,
  useCreateTeacher,
  useDeleteTeacher,
  useUpdateTeacher,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

const GRADE_OPTIONS = [
  "Not Assigned",
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
];

type TeacherForm = {
  firstName: string;
  lastName: string;
  subjects: string;
  contactEmail: string;
  contactPhone: string;
  dateOfJoin: string;
  grade: string;
  isActive: boolean;
};

const emptyForm: TeacherForm = {
  firstName: "",
  lastName: "",
  subjects: "",
  contactEmail: "",
  contactPhone: "",
  dateOfJoin: new Date().toISOString().split("T")[0],
  grade: "Not Assigned",
  isActive: true,
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });
}

const TEACHER_CSV_HEADERS =
  "firstName,lastName,subjects,contactEmail,contactPhone,dateOfJoin,grade";
const TEACHER_CSV_SAMPLE =
  'Anita,Sharma,"Mathematics,Science",anita.sharma@school.in,9876543210,2024-06-01,Grade 8\n' +
  "Ravi,Kumar,English,ravi.kumar@school.in,9123456780,2024-06-01,Grade 10";

export default function TeachersPage() {
  const { data: teachers, isLoading } = useAllTeachers();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();
  const { actor } = useActor();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bulk upload
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<Record<string, string>[]>([]);
  const [bulkProgress, setBulkProgress] = useState<{
    done: number;
    total: number;
    running: boolean;
    failed: number;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      grade: t.grade ?? "Not Assigned",
      isActive: t.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const grade = form.grade === "Not Assigned" ? null : form.grade;
    const dateOfJoin = dateToBigInt(new Date(form.dateOfJoin));
    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      subjects: form.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      dateOfJoin,
      grade,
      isActive: form.isActive,
    };
    try {
      if (editTeacher) {
        await updateTeacher.mutateAsync({ id: editTeacher.id, ...data });
        toast.success("Teacher updated");
      } else {
        await createTeacher.mutateAsync(data);
        // Sync to staff module
        if (actor) {
          try {
            await actor.createStaff(
              form.firstName,
              form.lastName,
              "Teacher",
              "",
              "Full-Time",
              BigInt(0),
              form.contactEmail,
              form.contactPhone,
              dateOfJoin,
              form.isActive,
            );
          } catch {
            // Staff sync failure is non-blocking
          }
        }
        toast.success("Teacher created and synced to staff");
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

  const downloadTemplate = () => {
    const csv = `${TEACHER_CSV_HEADERS}\n${TEACHER_CSV_SAMPLE}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teachers_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setBulkRows(parseCSV(text));
      setBulkProgress(null);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (bulkRows.length === 0) return;
    setBulkProgress({
      done: 0,
      total: bulkRows.length,
      running: true,
      failed: 0,
    });
    let failed = 0;
    for (let i = 0; i < bulkRows.length; i++) {
      const row = bulkRows[i];
      try {
        const subjects = row.subjects
          ? row.subjects
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        const dateOfJoin = row.dateOfJoin
          ? dateToBigInt(new Date(row.dateOfJoin))
          : dateToBigInt(new Date());
        const grade =
          row.grade && row.grade !== "Not Assigned" ? row.grade : null;
        await createTeacher.mutateAsync({
          firstName: row.firstName ?? "",
          lastName: row.lastName ?? "",
          subjects,
          contactEmail: row.contactEmail ?? "",
          contactPhone: row.contactPhone ?? "",
          dateOfJoin,
          grade,
          isActive: true,
        });
        if (actor) {
          try {
            await actor.createStaff(
              row.firstName ?? "",
              row.lastName ?? "",
              "Teacher",
              "",
              "Full-Time",
              BigInt(0),
              row.contactEmail ?? "",
              row.contactPhone ?? "",
              dateOfJoin,
              true,
            );
          } catch {
            // Non-blocking
          }
        }
      } catch {
        failed++;
      }
      setBulkProgress({
        done: i + 1,
        total: bulkRows.length,
        running: i + 1 < bulkRows.length,
        failed,
      });
    }
    toast.success(
      `Import complete: ${bulkRows.length - failed} imported, ${failed} failed.`,
    );
  };

  const isPending = createTeacher.isPending || updateTeacher.isPending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Teachers"
        description="Manage teaching staff records"
        actions={
          <div className="flex gap-2">
            <Button
              data-ocid="teachers.bulk.upload_button"
              variant="outline"
              onClick={() => {
                setBulkRows([]);
                setBulkProgress(null);
                setBulkOpen(true);
              }}
            >
              <Upload className="h-4 w-4 mr-2" /> Bulk Upload
            </Button>
            <Button
              data-ocid="teachers.add.primary_button"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Teacher
            </Button>
          </div>
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
              <TableHead>Grade</TableHead>
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
              ["s1", "s2", "s3", "s4", "s5"].map((sk) => (
                <TableRow key={sk}>
                  {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map(
                    (ck) => (
                      <TableCell key={ck}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
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
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      {t.grade ?? "Not Assigned"}
                    </span>
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

      {/* Add/Edit Dialog */}
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
              <Label>Grade Assignment</Label>
              <Select
                value={form.grade}
                onValueChange={(v) => setForm((f) => ({ ...f, grade: v }))}
              >
                <SelectTrigger data-ocid="teachers.modal.grade.select">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent data-ocid="teachers.bulk.dialog" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Teachers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download CSV Template
              </Button>
              <span className="text-sm text-muted-foreground">
                Columns: firstName, lastName, subjects, contactEmail,
                contactPhone, dateOfJoin, grade
              </span>
            </div>
            <div>
              <Label>Upload CSV File</Label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-border file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-accent cursor-pointer"
                onChange={handleFileChange}
              />
            </div>
            {bulkRows.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  {bulkRows.length} rows ready to import
                </p>
                <div className="max-h-48 overflow-y-auto rounded border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkRows.slice(0, 10).map((row) => (
                        <TableRow
                          key={`${row.firstName}-${row.lastName}-${row.contactEmail}`}
                        >
                          <TableCell>{row.firstName}</TableCell>
                          <TableCell>{row.lastName}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.subjects}
                          </TableCell>
                          <TableCell>{row.grade}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {bulkRows.length > 10 && (
                    <p className="text-xs text-muted-foreground p-2">
                      ...and {bulkRows.length - 10} more rows
                    </p>
                  )}
                </div>
              </div>
            )}
            {bulkProgress && (
              <div className="bg-muted rounded p-3 text-sm">
                {bulkProgress.running ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing {bulkProgress.done}/{bulkProgress.total}...
                  </span>
                ) : (
                  <span className="text-success font-medium">
                    Done: {bulkProgress.total - bulkProgress.failed} imported,{" "}
                    {bulkProgress.failed} failed.
                  </span>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="teachers.bulk.cancel_button"
              onClick={() => setBulkOpen(false)}
            >
              Close
            </Button>
            <Button
              data-ocid="teachers.bulk.submit_button"
              onClick={handleBulkImport}
              disabled={
                bulkRows.length === 0 || (bulkProgress?.running ?? false)
              }
            >
              {bulkProgress?.running && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Import All ({bulkRows.length})
            </Button>
          </DialogFooter>
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
