import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  CheckCircle2,
  ClipboardCopy,
  Eye,
  EyeOff,
  Info,
  Loader2,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Teacher } from "../backend.d";
import { EmptyState, PageHeader } from "../components/shared";
import {
  useAllTeachers,
  useAllUserAccounts,
  useCreateUserAccount,
  useDeleteUserAccount,
} from "../hooks/useQueries";

// ── Helpers ──────────────────────────────────────────────────────────────────

function generatePassword(): string {
  return "teacher123";
}

function generateUsername(firstName: string, lastName: string): string {
  return (firstName.toLowerCase() + lastName.toLowerCase().charAt(0)).replace(
    /\s/g,
    "",
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DialogStep = "form" | "success";

type FormErrors = {
  teacher?: string;
  username?: string;
  password?: string;
};

type SuccessInfo = {
  name: string;
  username: string;
  password: string;
};

// ── Credential copy row ───────────────────────────────────────────────────────

function CredRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/50 border border-border">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p
          className={`text-sm font-semibold truncate ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shrink-0"
        title={`Copy ${label}`}
      >
        <ClipboardCopy className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const {
    data: allTeachers = [],
    isLoading: teachersLoading,
    refetch: refetchTeachers,
  } = useAllTeachers();

  const {
    data: userAccounts = [],
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useAllUserAccounts();

  const createAccountMutation = useCreateUserAccount();
  const deleteAccountMutation = useDeleteUserAccount();

  // Only show teacher accounts
  const teachers = userAccounts.filter((a) => a.role === "teacher");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<DialogStep>("form");
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  // Form state
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Filter teachers that don't already have a login
  const existingNames = new Set(teachers.map((t) => t.name.toLowerCase()));
  const availableTeachers = allTeachers.filter(
    (t: Teacher) =>
      !existingNames.has(`${t.firstName} ${t.lastName}`.toLowerCase()),
  );

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    setErrors((prev) => ({ ...prev, teacher: undefined }));

    const teacher = allTeachers.find((t: Teacher) => t.id === teacherId);
    if (!teacher) {
      setSelectedTeacherName("");
      setUsername("");
      setPassword("");
      return;
    }

    const fullName = `${teacher.firstName} ${teacher.lastName}`;
    const generatedUsername = generateUsername(
      teacher.firstName,
      teacher.lastName,
    );
    const generatedPassword = generatePassword();

    setSelectedTeacherName(fullName);
    setUsername(generatedUsername);
    setPassword(generatedPassword);
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase().replace(/\s/g, ""));
    if (errors.username)
      setErrors((prev) => ({ ...prev, username: undefined }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password)
      setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const handleRegenerate = () => {
    setPassword(generatePassword());
    if (errors.password)
      setErrors((prev) => ({ ...prev, password: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!selectedTeacherId) newErrors.teacher = "Please select a teacher";
    if (!username.trim()) newErrors.username = "Username is required";
    else if (/\s/.test(username))
      newErrors.username = "Username cannot contain spaces";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Minimum 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const created = await createAccountMutation.mutateAsync({
        username: username.trim(),
        password,
        role: "teacher",
        name: selectedTeacherName,
      });
      if (created) {
        setSuccessInfo({
          name: selectedTeacherName,
          username: username.trim(),
          password,
        });
        setDialogStep("success");
      } else {
        toast.error("Username already exists. Please choose a different one.");
      }
    } catch {
      toast.error("Failed to create teacher login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uname: string) => {
    try {
      await deleteAccountMutation.mutateAsync(uname);
      toast.success(`Teacher account "${uname}" removed`);
    } catch {
      toast.error("Failed to remove account");
    }
    setDeleteTarget(null);
  };

  const resetDialog = () => {
    setDialogStep("form");
    setSelectedTeacherId("");
    setSelectedTeacherName("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setErrors({});
    setSuccessInfo(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) resetDialog();
    setIsDialogOpen(open);
  };

  const isLoadingList = accountsLoading;

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
          <button
            type="button"
            onClick={() => void refetchAccounts()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Refresh list"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {isLoadingList ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading accounts...
          </div>
        ) : teachers.length === 0 ? (
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
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent data-ocid="teacher_accounts.dialog" className="max-w-md">
          {dialogStep === "form" ? (
            <>
              <DialogHeader>
                <DialogTitle>Create Teacher Login</DialogTitle>
                <DialogDescription>
                  Select a teacher from your staff list — credentials will be
                  auto-generated.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Teacher selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="select-teacher">Select Teacher *</Label>
                    <button
                      type="button"
                      onClick={() => void refetchTeachers()}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      title="Refresh teacher list"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </button>
                  </div>
                  {teachersLoading ? (
                    <div
                      data-ocid="teacher_accounts.select.loading_state"
                      className="flex items-center gap-2 h-10 px-3 rounded-md border border-input text-sm text-muted-foreground"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading teachers...
                    </div>
                  ) : (
                    <Select
                      value={selectedTeacherId}
                      onValueChange={handleTeacherSelect}
                    >
                      <SelectTrigger
                        id="select-teacher"
                        data-ocid="teacher_accounts.select"
                      >
                        <SelectValue
                          placeholder={
                            allTeachers.length === 0
                              ? "No teachers found — add teachers first"
                              : availableTeachers.length === 0
                                ? "All teachers already have logins"
                                : "Choose a teacher..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeachers.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground space-y-2">
                            <p>
                              {allTeachers.length === 0
                                ? "No teachers found — add teachers first"
                                : "All teachers already have logins"}
                            </p>
                            {allTeachers.length === 0 && (
                              <button
                                type="button"
                                onClick={() => void refetchTeachers()}
                                className="flex items-center gap-1 mx-auto text-xs text-primary hover:underline"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Retry
                              </button>
                            )}
                          </div>
                        ) : (
                          availableTeachers.map((t: Teacher) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.firstName} {t.lastName}
                              {t.grade ? (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({t.grade})
                                </span>
                              ) : null}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.teacher && (
                    <p
                      data-ocid="teacher_accounts.select.error_state"
                      className="text-xs text-destructive"
                    >
                      {errors.teacher}
                    </p>
                  )}
                </div>

                {/* Auto-filled name (read-only) */}
                {selectedTeacherName && (
                  <div className="space-y-1.5">
                    <Label>Teacher Name</Label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/40 text-sm font-medium text-foreground">
                      {selectedTeacherName}
                    </div>
                  </div>
                )}

                {/* Username */}
                {selectedTeacherId && (
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher-username">Username *</Label>
                    <Input
                      id="teacher-username"
                      data-ocid="teacher_accounts.input"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="font-mono"
                      placeholder="auto-generated username"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from teacher name — you can edit it.
                    </p>
                    {errors.username && (
                      <p
                        data-ocid="teacher_accounts.username.error_state"
                        className="text-xs text-destructive"
                      >
                        {errors.username}
                      </p>
                    )}
                  </div>
                )}

                {/* Password */}
                {selectedTeacherId && (
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher-password">Password *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="teacher-password"
                          data-ocid="teacher_accounts.password.input"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          className="pr-10 font-mono"
                          placeholder="auto-generated password"
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRegenerate}
                        title="Generate new password"
                        data-ocid="teacher_accounts.password.button"
                        className="shrink-0"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-generated — click{" "}
                      <RefreshCw className="inline h-3 w-3" /> to regenerate or
                      type a custom password.
                    </p>
                    {errors.password && (
                      <p
                        data-ocid="teacher_accounts.password.error_state"
                        className="text-xs text-destructive"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  data-ocid="teacher_accounts.cancel_button"
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="teacher_accounts.submit_button"
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={isSubmitting || !selectedTeacherId}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {isSubmitting ? "Creating..." : "Create Login"}
                </Button>
              </div>
            </>
          ) : (
            /* ── Success step ── */
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Login Created!
                </DialogTitle>
                <DialogDescription>
                  Login created for{" "}
                  <strong className="text-foreground">
                    {successInfo?.name}
                  </strong>
                  . Share these credentials with the teacher.
                </DialogDescription>
              </DialogHeader>

              <div
                data-ocid="teacher_accounts.success_state"
                className="space-y-3 py-2"
              >
                <div className="p-4 rounded-lg border border-green-200 bg-green-50/60 space-y-3">
                  <CredRow
                    label="Username"
                    value={successInfo?.username ?? ""}
                    mono
                  />
                  <CredRow
                    label="Password"
                    value={successInfo?.password ?? ""}
                    mono
                  />
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">
                    Share these credentials with the teacher. Credentials are
                    now saved to the school database and will work on any
                    device.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  data-ocid="teacher_accounts.close_button"
                  onClick={() => handleDialogOpenChange(false)}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Done
                </Button>
              </div>
            </>
          )}
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
                onClick={() => void handleDelete(deleteTarget)}
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
