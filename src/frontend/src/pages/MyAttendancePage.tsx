import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import {
  usePendingAttendanceCorrections,
  useSubmitAttendanceCorrection,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

export default function MyAttendancePage() {
  const { user } = useLocalAuth();
  const staffId = user?.username ?? "";

  const { data: corrections, isLoading } = usePendingAttendanceCorrections();
  const submitCorrection = useSubmitAttendanceCorrection();

  // Filter corrections for this teacher
  const myCorrections = (corrections ?? []).filter(
    (c) => c.staffId === staffId,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    requestedStatus: "Present",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) {
      toast.error("User not found");
      return;
    }
    try {
      await submitCorrection.mutateAsync({
        staffId,
        date: dateToBigInt(new Date(form.date)),
        requestedStatus: form.requestedStatus,
        reason: form.reason,
      });
      toast.success("Attendance correction request submitted");
      setModalOpen(false);
      setForm((f) => ({ ...f, reason: "" }));
    } catch {
      toast.error("Failed to submit correction request");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Attendance"
        description="Submit and track attendance correction requests"
        actions={
          <Button
            data-ocid="my_attendance.add.primary_button"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Submit Correction Request
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3"].map((k) => (
            <Skeleton key={k} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : myCorrections.length === 0 ? (
        <EmptyState
          title="No correction requests"
          description="Submit an attendance correction request if your attendance was incorrectly recorded."
          ocid="my_attendance.list.empty_state"
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Submit Request
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {myCorrections.map((c, i) => (
            <div
              key={c.id}
              data-ocid={`my_attendance.list.item.${i + 1}`}
              className="bg-card border border-border rounded-lg p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-sm">
                      {bigIntToDateString(c.date)}
                    </p>
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs ${
                        STATUS_COLORS[c.status.toLowerCase()] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.status}
                    </Badge>
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                      Requested: {c.requestedStatus}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="my_attendance.modal">
          <DialogHeader>
            <DialogTitle>Submit Attendance Correction Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                data-ocid="my_attendance.modal.date.input"
                type="date"
                required
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Requested Status *</Label>
              <Select
                value={form.requestedStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, requestedStatus: v }))
                }
              >
                <SelectTrigger data-ocid="my_attendance.modal.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                data-ocid="my_attendance.modal.reason.textarea"
                required
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                rows={3}
                placeholder="Explain why your attendance needs correction..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="my_attendance.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="my_attendance.modal.submit_button"
                type="submit"
                disabled={submitCorrection.isPending}
              >
                {submitCorrection.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
