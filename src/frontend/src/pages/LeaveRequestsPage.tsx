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
import { CheckCircle, Loader2, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader, StatusBadge } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import {
  useAllStaff,
  useApproveLeaveRequest,
  useLeaveRequestsByStaffId,
  usePendingLeaveRequests,
  useRejectLeaveRequest,
  useSubmitLeaveRequest,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

export default function LeaveRequestsPage() {
  const { user } = useLocalAuth();
  const role = user?.role ?? "";
  const isAdmin =
    role === "superadmin" || role === "schooladmin" || role === "hr";

  // Admin hooks
  const { data: pendingRequests, isLoading: pendingLoading } =
    usePendingLeaveRequests();
  const { data: staff } = useAllStaff();
  const approveLeave = useApproveLeaveRequest();
  const rejectLeave = useRejectLeaveRequest();

  // Teacher self-service hooks
  const staffId = user?.username ?? "";
  const { data: myRequests, isLoading: myLoading } = useLeaveRequestsByStaffId(
    !isAdmin ? staffId : "",
  );

  const submitLeave = useSubmitLeaveRequest();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    staffId: isAdmin ? "" : staffId,
    leaveType: "annual",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStaffId = isAdmin ? form.staffId : staffId;
    if (!effectiveStaffId) {
      toast.error("Staff ID is required");
      return;
    }
    try {
      await submitLeave.mutateAsync({
        staffId: effectiveStaffId,
        leaveType: form.leaveType,
        startDate: dateToBigInt(new Date(form.startDate)),
        endDate: dateToBigInt(new Date(form.endDate)),
        reason: form.reason,
      });
      toast.success("Leave request submitted");
      setModalOpen(false);
      setForm((f) => ({ ...f, reason: "", staffId: isAdmin ? "" : staffId }));
    } catch {
      toast.error("Submission failed");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveLeave.mutateAsync(id);
      toast.success("Leave approved");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectLeave.mutateAsync(id);
      toast.success("Leave rejected");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const getStaffName = (id: string) => {
    const s = staff?.find((s) => s.id === id);
    return s ? `${s.firstName} ${s.lastName}` : id;
  };

  const isLoading = isAdmin ? pendingLoading : myLoading;
  const requests = isAdmin ? (pendingRequests ?? []) : (myRequests ?? []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title={isAdmin ? "Leave Requests" : "My Leave Requests"}
        description={
          isAdmin
            ? "Review and manage staff leave applications"
            : "Submit and track your leave requests"
        }
        actions={
          <Button
            data-ocid="leave.add.primary_button"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3", "s4"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title={
            isAdmin ? "No pending leave requests" : "No leave requests yet"
          }
          description={
            isAdmin
              ? "All leave requests have been reviewed, or none submitted yet."
              : "Submit a leave request using the button above."
          }
          ocid="leave.list.empty_state"
        />
      ) : (
        <div className="space-y-3">
          {requests.map((r, i) => (
            <div
              key={r.id}
              data-ocid={`leave.list.item.${i + 1}`}
              className="bg-card border border-border rounded-lg p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {isAdmin && (
                      <p className="font-semibold">{getStaffName(r.staffId)}</p>
                    )}
                    <StatusBadge status={r.status.toLowerCase()} />
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded capitalize">
                      {r.leaveType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {bigIntToDateString(r.startDate)} →{" "}
                    {bigIntToDateString(r.endDate)}
                  </p>
                  <p className="text-sm text-foreground mt-1">{r.reason}</p>
                </div>
                {isAdmin && r.status.toLowerCase() === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      data-ocid={`leave.list.approve.${i + 1}`}
                      onClick={() => handleApprove(r.id)}
                      disabled={approveLeave.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200 text-sm font-medium hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                    <button
                      type="button"
                      data-ocid={`leave.list.reject.${i + 1}`}
                      onClick={() => handleReject(r.id)}
                      disabled={rejectLeave.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Leave Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="leave.modal">
          <DialogHeader>
            <DialogTitle>Submit Leave Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin && (
              <div className="space-y-2">
                <Label>Staff Member *</Label>
                <Select
                  value={form.staffId}
                  onValueChange={(v) => setForm((f) => ({ ...f, staffId: v }))}
                >
                  <SelectTrigger data-ocid="leave.modal.staff.select">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {(staff ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={form.leaveType}
                onValueChange={(v) => setForm((f) => ({ ...f, leaveType: v }))}
              >
                <SelectTrigger data-ocid="leave.modal.type.select">
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
                <Label>Start Date</Label>
                <Input
                  data-ocid="leave.modal.startdate.input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  data-ocid="leave.modal.enddate.input"
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                data-ocid="leave.modal.reason.textarea"
                value={form.reason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reason: e.target.value }))
                }
                rows={3}
                placeholder="Reason for leave..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="leave.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="leave.modal.submit_button"
                type="submit"
                disabled={submitLeave.isPending || (isAdmin && !form.staffId)}
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
