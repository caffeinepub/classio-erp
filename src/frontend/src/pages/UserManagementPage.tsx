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
import { Principal } from "@dfinity/principal";
import { Info, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserRole } from "../backend.d";
import { PageHeader } from "../components/shared";
import { useActor } from "../hooks/useActor";

export default function UserManagementPage() {
  const { actor } = useActor();
  const [principalId, setPrincipalId] = useState("");
  const [role, setRole] = useState<string>("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    try {
      setIsSubmitting(true);
      const principal = Principal.fromText(principalId.trim());
      await actor.assignCallerUserRole(principal, role as UserRole);
      toast.success(
        `Role "${role}" assigned to ${principalId.slice(0, 12)}...`,
      );
      setPrincipalId("");
    } catch (err) {
      toast.error(
        `Failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    try {
      const principal = Principal.fromText(lookupId.trim());
      const profile = await actor.getUserProfile(principal);
      if (!profile) {
        setLookupResult("No profile found for this principal");
      } else {
        setLookupResult(`Name: ${profile.name} | Role: ${profile.role}`);
      }
    } catch (err) {
      setLookupResult(
        `Error: ${err instanceof Error ? err.message : "Invalid principal"}`,
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="User Management"
        description="Assign roles to users via their Principal ID"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assign Role */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Assign Role
            </CardTitle>
            <CardDescription>
              Grant admin, user, or guest access to a principal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-2">
                <Label>Principal ID</Label>
                <Input
                  data-ocid="usermgmt.principal.input"
                  value={principalId}
                  onChange={(e) => setPrincipalId(e.target.value)}
                  placeholder="e.g. aaaaa-aa or full principal"
                  required
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger data-ocid="usermgmt.role.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Admin — Full system access
                      </div>
                    </SelectItem>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        User — Standard access
                      </div>
                    </SelectItem>
                    <SelectItem value="guest">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        Guest — Read-only access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                data-ocid="usermgmt.assign.primary_button"
                type="submit"
                className="w-full"
                disabled={isSubmitting || !principalId.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Role"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lookup User */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Lookup User
            </CardTitle>
            <CardDescription>
              View a user's profile and current role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div className="space-y-2">
                <Label>Principal ID</Label>
                <Input
                  data-ocid="usermgmt.lookup.input"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Enter principal to lookup"
                  required
                  className="font-mono text-sm"
                />
              </div>
              <Button
                data-ocid="usermgmt.lookup.primary_button"
                type="submit"
                variant="outline"
                className="w-full"
              >
                Lookup User
              </Button>
              {lookupResult && (
                <div
                  data-ocid="usermgmt.lookup.success_state"
                  className="bg-muted rounded-lg p-3 text-sm"
                >
                  {lookupResult}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6 shadow-card border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-semibold">How to find a Principal ID:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                <li>
                  Ask the user to log in and share their principal from the
                  Settings page
                </li>
                <li>
                  The principal is a unique identifier tied to their Internet
                  Identity
                </li>
                <li>
                  Roles: <strong>admin</strong> = full access,{" "}
                  <strong>user</strong> = staff/teacher, <strong>guest</strong>{" "}
                  = read-only
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
