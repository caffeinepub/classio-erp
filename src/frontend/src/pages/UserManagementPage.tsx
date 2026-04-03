import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";

type TeacherAccount = {
  username: string;
  name: string;
  role: string;
  password: string;
};

function getTeacherAccounts(): TeacherAccount[] {
  try {
    const raw = localStorage.getItem("classio_registered_users");
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<
      string,
      { password: string; role: string; name: string }
    >;
    return Object.entries(map)
      .filter(([, data]) => data.role === "teacher")
      .map(([username, data]) => ({ username, ...data }));
  } catch {
    return [];
  }
}

function deleteTeacherAccount(username: string) {
  try {
    const raw = localStorage.getItem("classio_registered_users");
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, unknown>;
    delete map[username.toLowerCase()];
    localStorage.setItem("classio_registered_users", JSON.stringify(map));
  } catch {
    // ignore
  }
}

type FormState = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export default function UserManagementPage() {
  const { registerUser } = useLocalAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const teachers = refreshKey >= 0 ? getTeacherAccounts() : [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === "username" ? value.toLowerCase().replace(/\s/g, "") : value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 4)
      newErrors.password = "Minimum 4 characters";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const result = registerUser(
        form.username.trim(),
        form.password,
        "teacher",
        form.name.trim(),
      );
      if (result.success) {
        toast.success(`Teacher login for "${form.name.trim()}" created!`);
        setForm(EMPTY_FORM);
        setErrors({});
        setIsDialogOpen(false);
        refresh();
      } else {
        toast.error(result.error ?? "Failed to create teacher login");
      }
      setIsSubmitting(false);
    }, 300);
  };

  const handleDelete = (username: string) => {
    deleteTeacherAccount(username);
    toast.success(`Teacher account "${username}" removed`);
    setDeleteTarget(null);
    refresh();
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Teacher Accounts"
        description="Manage teacher login credentials"
        actions={
          <Button
            data-ocid="teacher_accounts.open_modal_button"
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create Teacher Login
          </Button>
        }
      />

      {/* Info card */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 mb-6">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Teacher Login Credentials
          </p>
          <p className="text-sm text-blue-700 mt-0.5">
            Teachers can sign in using the credentials you create here. They
            will have access to:
          </p>
          <ul className="mt-2 space-y-1">
            {[
              "Leave requests — submit and track leave applications",
              "Attendance correction requests",
              "Salary Slip — view and download",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-blue-700"
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Teacher list */}
      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Teacher Logins
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {teachers.length} teacher{teachers.length !== 1 ? "s" : ""} with
              login access
            </p>
          </div>
        </div>

        {teachers.length === 0 ? (
          <EmptyState
            ocid="teacher_accounts.empty_state"
            title="No teacher logins yet"
            description="Create a teacher login so teachers can sign in and access their dashboard."
            action={
              <Button
                data-ocid="teacher_accounts.empty.open_modal_button"
                onClick={() => setIsDialogOpen(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Create First Teacher Login
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher, idx) => (
                <TableRow
                  key={teacher.username}
                  data-ocid={`teacher_accounts.item.${idx + 1}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-primary text-sm font-semibold">
                          {teacher.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-sm">
                        {teacher.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">
                      @{teacher.username}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 capitalize text-xs"
                    >
                      Teacher
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      data-ocid={`teacher_accounts.delete_button.${idx + 1}`}
                      onClick={() => setDeleteTarget(teacher.username)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
                      title="Remove teacher login"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Teacher Login Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent data-ocid="teacher_accounts.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Teacher Login</DialogTitle>
            <DialogDescription>
              Set up a username and password so the teacher can sign in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="teacher-name">Full Name *</Label>
              <Input
                id="teacher-name"
                data-ocid="teacher_accounts.name.input"
                placeholder="e.g. Rajesh Kumar"
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
              {errors.name && (
                <p
                  data-ocid="teacher_accounts.name.error_state"
                  className="text-xs text-destructive"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teacher-username">Username *</Label>
              <Input
                id="teacher-username"
                data-ocid="teacher_accounts.input"
                placeholder="e.g. rkumar (no spaces, lowercase)"
                value={form.username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                className="font-mono"
              />
              {errors.username && (
                <p
                  data-ocid="teacher_accounts.username.error_state"
                  className="text-xs text-destructive"
                >
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teacher-password">Password *</Label>
              <div className="relative">
                <Input
                  id="teacher-password"
                  data-ocid="teacher_accounts.password.input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 4 characters"
                  value={form.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  data-ocid="teacher_accounts.password.error_state"
                  className="text-xs text-destructive"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teacher-confirm">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="teacher-confirm"
                  data-ocid="teacher_accounts.confirm_password.input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat the password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleFieldChange("confirmPassword", e.target.value)
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  data-ocid="teacher_accounts.confirm_password.error_state"
                  className="text-xs text-destructive"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              data-ocid="teacher_accounts.cancel_button"
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              data-ocid="teacher_accounts.submit_button"
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSubmitting ? "Creating..." : "Create Login"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay dismiss */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />
          <div
            data-ocid="teacher_accounts.delete.dialog"
            className="relative bg-card border border-border rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 z-10"
          >
            <h3 className="font-semibold text-foreground text-lg">
              Remove Teacher Login
            </h3>
            <p className="text-muted-foreground text-sm mt-2">
              Remove login access for{" "}
              <strong className="text-foreground">@{deleteTarget}</strong>? They
              will no longer be able to sign in.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                data-ocid="teacher_accounts.delete.cancel_button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="teacher_accounts.delete.confirm_button"
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Remove Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
