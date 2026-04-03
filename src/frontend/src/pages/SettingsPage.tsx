import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Loader2, School, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSchoolProfile } from "../hooks/useQueries";
import { useCallerUserProfile, useSaveUserProfile } from "../hooks/useQueries";

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } = useCallerUserProfile();
  const { data: schoolProfile, isLoading: schoolLoading } = useSchoolProfile();
  const saveProfile = useSaveUserProfile();
  const { identity } = useInternetIdentity();

  const [userName, setUserName] = useState(profile?.name ?? "");
  const [schoolForm, setSchoolForm] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
    motto: "",
  });

  // Sync from loaded data
  const handleSchoolLoad = () => {
    if (schoolProfile) {
      setSchoolForm({
        schoolName: schoolProfile.schoolName,
        address: schoolProfile.address,
        phone: schoolProfile.phone,
        email: schoolProfile.email,
        motto: schoolProfile.motto,
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile.mutateAsync({
        name: userName,
        role: profile?.role ?? "user",
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const principal = identity?.getPrincipal().toString() ?? "";

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principal);
    toast.success("Principal ID copied");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your profile and school information"
      />

      <div className="space-y-6">
        {/* My Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    data-ocid="settings.profile.name.input"
                    value={userName || profile?.name || ""}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={profile?.role ?? "—"}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Principal ID</Label>
                  <div className="flex gap-2">
                    <Input
                      data-ocid="settings.principal.input"
                      value={principal}
                      readOnly
                      className="font-mono text-xs bg-muted"
                    />
                    <Button
                      data-ocid="settings.copy.button"
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyPrincipal}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this with your Super Admin to get role assigned
                  </p>
                </div>
                <Button
                  data-ocid="settings.profile.submit_button"
                  type="submit"
                  disabled={saveProfile.isPending}
                >
                  {saveProfile.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Profile
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* School Profile */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" /> School Information
            </CardTitle>
            {schoolProfile && !schoolLoading && (
              <Button variant="outline" size="sm" onClick={handleSchoolLoad}>
                Load Current
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {schoolLoading ? (
              <div className="space-y-3">
                {["f1", "f2", "f3", "f4", "f5"].map((k) => (
                  <Skeleton key={k} className="h-10" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground">
                  School profile is managed through the backend canister. Use
                  the fields below as reference.
                </div>
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input
                    data-ocid="settings.school.name.input"
                    value={schoolForm.schoolName}
                    onChange={(e) =>
                      setSchoolForm((f) => ({
                        ...f,
                        schoolName: e.target.value,
                      }))
                    }
                    placeholder={schoolProfile?.schoolName ?? "School name"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    data-ocid="settings.school.address.input"
                    value={schoolForm.address}
                    onChange={(e) =>
                      setSchoolForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder={schoolProfile?.address ?? "School address"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      data-ocid="settings.school.phone.input"
                      value={schoolForm.phone}
                      onChange={(e) =>
                        setSchoolForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder={schoolProfile?.phone ?? "Phone number"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      data-ocid="settings.school.email.input"
                      type="email"
                      value={schoolForm.email}
                      onChange={(e) =>
                        setSchoolForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder={schoolProfile?.email ?? "school@example.com"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Motto</Label>
                  <Input
                    data-ocid="settings.school.motto.input"
                    value={schoolForm.motto}
                    onChange={(e) =>
                      setSchoolForm((f) => ({ ...f, motto: e.target.value }))
                    }
                    placeholder={schoolProfile?.motto ?? "School motto"}
                  />
                </div>
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground">
                    Current:{" "}
                    <strong>
                      {schoolProfile?.schoolName ?? "Not configured"}
                    </strong>{" "}
                    — {schoolProfile?.motto ?? ""}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
