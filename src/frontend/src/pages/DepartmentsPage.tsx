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
import { Textarea } from "@/components/ui/textarea";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Department } from "../backend.d";
import { ConfirmDialog, EmptyState, PageHeader } from "../components/shared";
import {
  useAddOrUpdateDepartment,
  useAllDepartments,
  useDeleteDepartment,
} from "../hooks/useQueries";

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useAllDepartments();
  const upsertDept = useAddOrUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [modalOpen, setModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditDept(null);
    setName("");
    setDescription("");
    setModalOpen(true);
  };

  const openEdit = (d: Department) => {
    setEditDept(d);
    setName(d.name);
    setDescription(d.description);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertDept.mutateAsync({
        id: editDept?.id ?? "",
        name,
        description,
      });
      toast.success(editDept ? "Department updated" : "Department created");
      setModalOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDept.mutateAsync(deleteId);
      toast.success("Department deleted");
      setDeleteId(null);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Departments"
        description="Manage organizational departments"
        actions={
          <Button
            data-ocid="departments.add.primary_button"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Department
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["s1", "s2", "s3", "s4"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : !departments || departments.length === 0 ? (
        <EmptyState
          title="No departments yet"
          description="Create your first department"
          ocid="departments.list.empty_state"
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((d, i) => (
            <div
              key={d.id}
              data-ocid={`departments.list.item.${i + 1}`}
              className="bg-card border border-border rounded-lg p-4 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{d.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {d.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    data-ocid={`departments.list.edit_button.${i + 1}`}
                    onClick={() => openEdit(d)}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`departments.list.delete_button.${i + 1}`}
                    onClick={() => setDeleteId(d.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="departments.modal">
          <DialogHeader>
            <DialogTitle>
              {editDept ? "Edit Department" : "Add Department"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input
                data-ocid="departments.modal.name.input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Academic Affairs"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                data-ocid="departments.modal.description.textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Department description..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="departments.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="departments.modal.submit_button"
                type="submit"
                disabled={upsertDept.isPending}
              >
                {upsertDept.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editDept ? "Update" : "Create"} Department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Department"
        description="Are you sure? Staff in this department won't be auto-reassigned."
        onConfirm={handleDelete}
        isLoading={deleteDept.isPending}
      />
    </div>
  );
}
