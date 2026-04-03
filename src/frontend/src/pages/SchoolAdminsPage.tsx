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
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAssignRole, useCallerRole } from "../hooks/useQueries";

export default function SchoolAdminsPage() {
  const { identity } = useInternetIdentity();
  const { data: myRole } = useCallerRole();
  const assignRole = useAssignRole();

  const [principalText, setPrincipalText] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  const myPrincipal = identity?.getPrincipal().toString() ?? "Not logged in";
  const roleStr =
    typeof myRole === "object" && myRole !== null
      ? Object.keys(myRole as object)[0]
      : typeof myRole === "string"
        ? myRole
        : "unknown";

  const handleGrantAdmin = async () => {
    if (!principalText.trim()) {
      toast.error("Please enter a principal ID");
      return;
    }
    setIsGranting(true);
    try {
      // Dynamically import Principal
      const { Principal } = await import("@icp-sdk/core/principal");
      const principal = Principal.fromText(principalText.trim());
      await assignRole.mutateAsync({
        user: principal,
        role: { schooladmin: null } as any,
      });
      toast.success("School admin role assigned successfully!");
      setPrincipalText("");
    } catch (err) {
      toast.error(
        `Failed to assign role: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsGranting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="School Admin Management"
        description="Super Admin panel — assign and manage school administrator roles"
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
            and finance modules. Only Super Admins can grant or revoke School
            Admin access. To add a new School Admin, share your Classio ERP URL
            with them, have them log in with Internet Identity, and then paste
            their Principal ID below.
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
            <CardDescription>Your current principal and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Principal ID
              </Label>
              <p className="text-xs font-mono bg-muted rounded px-2 py-1.5 mt-1 break-all">
                {myPrincipal}
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
                {roleStr}
              </Badge>
            </div>
            {roleStr !== "admin" && roleStr !== "superadmin" && (
              <div className="flex items-start gap-2 p-2 rounded bg-warning/10 border border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  You need the <strong>admin</strong> role to manage school
                  admins. Go to <strong>User Management</strong> to assign
                  yourself the admin role.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grant School Admin */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Grant School Admin
            </CardTitle>
            <CardDescription>
              Assign school admin role by principal ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Principal ID *</Label>
              <Input
                data-ocid="school_admins.input"
                placeholder="aaaaa-bbbbb-ccccc-ddddd-eee"
                value={principalText}
                onChange={(e) => setPrincipalText(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                The user's Internet Identity principal (found in User Management
                page)
              </p>
            </div>
            <Button
              data-ocid="school_admins.primary_button"
              onClick={handleGrantAdmin}
              disabled={isGranting || !principalText.trim()}
              className="w-full gap-2"
            >
              {isGranting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isGranting ? "Assigning..." : "Assign School Admin Role"}
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
                  "User management",
                  "Role assignment",
                  "School admin management",
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
