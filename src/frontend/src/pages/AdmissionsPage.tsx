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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Plus, UserCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import {
  useAllApplicants,
  useConvertApplicantToStudent,
  useCreateApplicant,
  useUpdateApplicantStatus,
} from "../hooks/useQueries";
import { bigIntToDateString } from "../utils/dateUtils";

type ApplicantStatus = "pending" | "accepted" | "rejected" | "enrolled";

const statusColors: Record<ApplicantStatus, string> = {
  pending: "bg-warning/20 text-warning border-warning/30",
  accepted: "bg-success/20 text-success border-success/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
  enrolled: "bg-primary/20 text-primary border-primary/30",
};

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  programApplied: "",
  classApplied: "",
  notes: "",
};

export default function AdmissionsPage() {
  const { data: applicants = [], isLoading } = useAllApplicants();
  const createApplicant = useCreateApplicant();
  const updateStatus = useUpdateApplicantStatus();
  const convertToStudent = useConvertApplicantToStudent();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered =
    filterStatus === "all"
      ? applicants
      : applicants.filter((a: any) => a.status === filterStatus);

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name, and email are required");
      return;
    }
    try {
      await createApplicant.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        programApplied: form.programApplied,
        classApplied: form.classApplied,
        dateApplied: BigInt(Date.now()),
        status: "pending",
        notes: form.notes,
      });
      toast.success("Applicant added successfully");
      setForm(defaultForm);
      setOpen(false);
    } catch {
      toast.error("Failed to add applicant");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Applicant ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleConvert = async (id: string) => {
    try {
      await convertToStudent.mutateAsync(id);
      toast.success("Applicant converted to student!");
    } catch {
      toast.error("Failed to convert applicant");
    }
  };

  const pendingCount = applicants.filter(
    (a: any) => a.status === "pending",
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Admissions Management"
        description={`${pendingCount} pending application${pendingCount !== 1 ? "s" : ""} awaiting review`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="admissions.open_modal_button"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Applicant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" data-ocid="admissions.dialog">
              <DialogHeader>
                <DialogTitle>Add New Applicant</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div className="space-y-1.5">
                  <Label>First Name *</Label>
                  <Input
                    data-ocid="admissions.input"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name *</Label>
                  <Input
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Program Applied</Label>
                  <Input
                    placeholder="Grade 6 - Science"
                    value={form.programApplied}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, programApplied: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Class Applied</Label>
                  <Input
                    placeholder="6A"
                    value={form.classApplied}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, classApplied: e.target.value }))
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea
                    data-ocid="admissions.textarea"
                    placeholder="Additional notes..."
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  data-ocid="admissions.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="admissions.submit_button"
                  onClick={handleSubmit}
                  disabled={createApplicant.isPending}
                >
                  {createApplicant.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Add Applicant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4" data-ocid="admissions.filter.tab">
        {["all", "pending", "accepted", "rejected", "enrolled"].map((s) => (
          <Button
            key={s}
            variant={filterStatus === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card shadow-card">
        <Table data-ocid="admissions.table">
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Program / Class</TableHead>
              <TableHead>Date Applied</TableHead>
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
                  data-ocid="admissions.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admissions.empty_state"
                >
                  No applicants found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((applicant: any, i: number) => (
                <TableRow
                  key={applicant.id}
                  data-ocid={`admissions.item.${i + 1}`}
                >
                  <TableCell className="font-medium">
                    {applicant.firstName} {applicant.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{applicant.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {applicant.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {applicant.programApplied || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {applicant.classApplied}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {bigIntToDateString(applicant.dateApplied)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        statusColors[
                          (applicant.status as ApplicantStatus) ?? "pending"
                        ]
                      }
                    >
                      {applicant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {applicant.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid={`admissions.confirm_button.${i + 1}`}
                            className="gap-1 text-success border-success/30 hover:bg-success/10 h-7 px-2 text-xs"
                            onClick={() =>
                              handleStatusUpdate(applicant.id, "accepted")
                            }
                          >
                            <CheckCircle2 className="h-3 w-3" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            data-ocid={`admissions.delete_button.${i + 1}`}
                            className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/10 h-7 px-2 text-xs"
                            onClick={() =>
                              handleStatusUpdate(applicant.id, "rejected")
                            }
                          >
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </>
                      )}
                      {applicant.status === "accepted" && (
                        <Button
                          size="sm"
                          data-ocid={`admissions.secondary_button.${i + 1}`}
                          className="gap-1 h-7 px-2 text-xs"
                          onClick={() => handleConvert(applicant.id)}
                          disabled={convertToStudent.isPending}
                        >
                          <UserCheck className="h-3 w-3" /> Enroll as Student
                        </Button>
                      )}
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
