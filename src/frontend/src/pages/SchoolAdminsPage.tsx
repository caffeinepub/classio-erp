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
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";

export default function SchoolAdminsPage() {
  const { user, registerUser } = useLocalAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  const myRole = user?.role ?? "unknown";

  const handleCreateAdmin = async () => {
    if (!username.trim() || !password.trim() || !name.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsGranting(true);
    setTimeout(() => {
      const result = registerUser(
        username.trim(),
        password.trim(),
        "schooladmin",
        name.trim(),
      );
      if (result.success) {
        toast.success(`School admin '${username}' created successfully!`);
        setUsername("");
        setPassword("");
        setName("");
      } else {
        toast.error(result.error ?? "Failed to create admin");
      }
      setIsGranting(false);
    }, 300);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="School Admin Management"
        description="Super Admin panel — create and manage school administrator accounts"
      />

      {/* Info Alert */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 mb-6">
        <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            About School Admins
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            School Admins can manage students, teachers, attendance, grades, HR,
            and finance modules. Only Super Admins can create School Admin
            accounts. Create an account below and share the credentials with the
            school administrator.
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
                {user?.username ?? "—"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium mt-0.5">{user?.name ?? "—"}</p>
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

        {/* Create School Admin */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-primary" />
              Create School Admin
            </CardTitle>
            <CardDescription>
              Create a new school admin account with username and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                placeholder="e.g. schooladmin1"
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
              onClick={handleCreateAdmin}
              disabled={
                isGranting ||
                !username.trim() ||
                !password.trim() ||
                !name.trim()
              }
              className="w-full gap-2"
            >
              {isGranting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isGranting ? "Creating..." : "Create School Admin Account"}
            </Button>
          </CardContent>
        </Card>
      </div>

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
                  "Create school admins",
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
                ],
              },
              {
                role: "Teacher",
                color: "text-success",
                bg: "bg-success/5 border-success/20",
                permissions: [
                  "LMS (Courses)",
                  "Assignments",
                  "Announcements",
                  "View attendance",
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
