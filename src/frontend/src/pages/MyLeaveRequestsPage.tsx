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
import { Calendar, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import {
  useLeaveRequestsByStaffId,
  useSubmitLeaveRequest,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

export default function MyLeaveRequestsPage() {
  const { user } = useLocalAuth();
  const staffId = user?.username ?? "";

  const { data: myRequests, isLoading } = useLeaveRequestsByStaffId(staffId);
  const submitLeave = useSubmitLeaveRequest();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    leaveType: "annual",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) {
      toast.error("User not found");
      return;
    }
    try {
      await submitLeave.mutateAsync({
        staffId,
        leaveType: form.leaveType,
        startDate: dateToBigInt(new Date(form.startDate)),
        endDate: dateToBigInt(new Date(form.endDate)),
        reason: form.reason,
      });
      toast.success("Leave request submitted successfully");
      setModalOpen(false);
      setForm((f) => ({ ...f, reason: "" }));
    } catch {
      toast.error("Failed to submit leave request");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Leave Requests"
        description="Submit and track your leave applications"
        actions={
          <Button
            data-ocid="my_leave.add.primary_button"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Submit Leave Request
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : !myRequests || myRequests.length === 0 ? (
        <EmptyState
          title="No leave requests yet"
          description="Submit your first leave request using the button above."
          ocid="my_leave.list.empty_state"
          action={
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Submit Request
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {myRequests.map((r, i) => (
            <div
              key={r.id}
              data-ocid={`my_leave.list.item.${i + 1}`}
              className="bg-card border border-border rounded-lg p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {bigIntToDateString(r.startDate)} →{" "}
                        {bigIntToDateString(r.endDate)}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs ${
                        STATUS_COLORS[r.status.toLowerCase()] ??
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.status}
                    </Badge>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded capitalize">
                      {r.leaveType}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{r.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="my_leave.modal">
          <DialogHeader>
            <DialogTitle>Submit Leave Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Leave Type *</Label>
              <Select
                value={form.leaveType}
                onValueChange={(v) => setForm((f) => ({ ...f, leaveType: v }))}
              >
                <SelectTrigger data-ocid="my_leave.modal.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  data-ocid="my_leave.modal.startdate.input"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  data-ocid="my_leave.modal.enddate.input"
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                data-ocid="my_leave.modal.reason.textarea"
                required
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                rows={3}
                placeholder="Briefly explain your reason for leave..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="my_leave.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="my_leave.modal.submit_button"
                type="submit"
                disabled={submitLeave.isPending}
              >
                {submitLeave.isPending && (
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
