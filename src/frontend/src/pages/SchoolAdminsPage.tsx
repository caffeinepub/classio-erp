import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { useAllUserAccounts, useDeleteUserAccount } from "../hooks/useQueries";

const ROLE_BADGE_COLORS: Record<string, string> = {
  superadmin: "bg-destructive/10 text-destructive border-destructive/30",
  schooladmin: "bg-primary/10 text-primary border-primary/30",
  teacher: "bg-success/10 text-success border-success/30",
  hr: "bg-warning/10 text-warning border-warning/30",
};

export default function SchoolAdminsPage() {
  const { user, registerUser } = useLocalAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  const {
    data: allAccounts = [],
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useAllUserAccounts();

  const deleteAccountMutation = useDeleteUserAccount();

  const myRole = user?.role ?? "unknown";
  const isSuper = myRole === "superadmin";
  const isSchoolAdmin = myRole === "schooladmin";

  // Roles that the current user can create
  const creatableRoles = isSuper
    ? [
        { value: "schooladmin", label: "School Admin" },
        { value: "teacher", label: "Teacher" },
        { value: "hr", label: "HR Manager" },
      ]
    : isSchoolAdmin
      ? [
          { value: "teacher", label: "Teacher" },
          { value: "hr", label: "HR Manager" },
        ]
      : [];

  const pageTitle = isSchoolAdmin
    ? "User Management"
    : "School Admin Management";
  const pageDesc = isSchoolAdmin
    ? "Create and manage Teacher and HR accounts"
    : "Super Admin panel \u2014 create and manage all user accounts";

  const handleCreate = async () => {
    if (!username.trim() || !password.trim() || !name.trim() || !selectedRole) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsGranting(true);
    try {
      const result = await registerUser(
        username.trim(),
        password.trim(),
        selectedRole,
        name.trim(),
      );
      if (result.success) {
        toast.success(
          `Account '${username}' (${selectedRole}) created successfully!`,
        );
        setUsername("");
        setPassword("");
        setName("");
        setSelectedRole("");
        void refetchAccounts();
      } else {
        toast.error(result.error ?? "Failed to create account");
      }
    } catch {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsGranting(false);
    }
  };

  const handleDelete = async (uname: string) => {
    try {
      await deleteAccountMutation.mutateAsync(uname);
      toast.success(`User '${uname}' removed`);
    } catch {
      toast.error("Failed to remove user");
    }
  };

  const usersList = allAccounts;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader title={pageTitle} description={pageDesc} />

      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 mb-6">
        <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            {isSchoolAdmin ? "User Management" : "About User Roles"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isSchoolAdmin
              ? "As a School Admin, you can create Teacher and HR accounts. Share credentials with the respective staff."
              : "Super Admins can create School Admin, Teacher, and HR accounts. School Admins can create Teacher and HR accounts."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Account */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              My Account
            </CardTitle>
            <CardDescription>Your current account and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Username</Label>
              <p className="text-xs font-mono bg-muted rounded px-2 py-1.5 mt-1">
                {user?.username ?? "\u2014"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium mt-0.5">
                {user?.name ?? "\u2014"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">
                Current Role
              </Label>
              <Badge
                variant="outline"
                className="capitalize text-xs bg-primary/10 text-primary border-primary/30"
              >
                {myRole}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Create User */}
        {creatableRoles.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-primary" />
                Create User Account
              </CardTitle>
              <CardDescription>
                Create a new account with username and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger data-ocid="school_admins.role.select">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {creatableRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  data-ocid="school_admins.name_input"
                  placeholder="e.g. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Username *</Label>
                <Input
                  data-ocid="school_admins.input"
                  placeholder="e.g. teacher1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password *</Label>
                <Input
                  data-ocid="school_admins.password_input"
                  type="password"
                  placeholder="Set a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                data-ocid="school_admins.primary_button"
                onClick={() => void handleCreate()}
                disabled={
                  isGranting ||
                  !username.trim() ||
                  !password.trim() ||
                  !name.trim() ||
                  !selectedRole
                }
                className="w-full gap-2"
              >
                {isGranting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isGranting ? "Creating..." : "Create Account"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Users List */}
      <Card className="shadow-card mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">All Created Accounts</CardTitle>
            <CardDescription>
              Accounts stored in the school database ({usersList.length} total)
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={() => void refetchAccounts()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading accounts...
            </div>
          ) : usersList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No accounts created yet.
            </p>
          ) : (
            <div className="space-y-2">
              {usersList.map((u) => (
                <div
                  key={u.username}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-primary text-sm font-semibold">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        @{u.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs ${
                        ROLE_BADGE_COLORS[u.role] ?? ""
                      }`}
                    >
                      {u.role === "hr"
                        ? "HR Manager"
                        : u.role === "schooladmin"
                          ? "School Admin"
                          : u.role}
                    </Badge>
                    <button
                      type="button"
                      data-ocid="school_admins.user.delete_button"
                      onClick={() => void handleDelete(u.username)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
                      title="Remove user"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Access Guide */}
      <Card className="shadow-card mt-6">
        <CardHeader>
          <CardTitle className="text-base">Role Access Guide</CardTitle>
          <CardDescription>
            What each role can access in Classio ERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                role: "Super Admin",
                color: "text-destructive",
                bg: "bg-destructive/5 border-destructive/20",
                permissions: [
                  "All modules",
                  "Create all user types",
                  "User management",
                  "Full system access",
                ],
              },
              {
                role: "School Admin",
                color: "text-primary",
                bg: "bg-primary/5 border-primary/20",
                permissions: [
                  "Students & Teachers",
                  "Attendance & Grades",
                  "HR Management",
                  "Finance & Admissions",
                  "Create Teacher/HR accounts",
                ],
              },
              {
                role: "Teacher",
                color: "text-success",
                bg: "bg-success/5 border-success/20",
                permissions: [
                  "LMS (Courses)",
                  "View students/classes",
                  "Leave requests",
                  "Attendance correction",
                  "Salary slip download",
                ],
              },
            ].map((r) => (
              <div key={r.role} className={`rounded-lg border p-4 ${r.bg}`}>
                <p className={`font-semibold text-sm mb-2 ${r.color}`}>
                  {r.role}
                </p>
                <ul className="space-y-1">
                  {r.permissions.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 text-current" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
