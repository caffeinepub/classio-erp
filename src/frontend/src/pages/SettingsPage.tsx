import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, ImagePlus, School, User, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import { useSchoolProfile } from "../hooks/useQueries";

const DEFAULT_LOGO =
  "/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg";

export default function SettingsPage() {
  const { user } = useLocalAuth();
  const { data: schoolProfile, isLoading: schoolLoading } = useSchoolProfile();

  const [schoolForm, setSchoolForm] = useState({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
    motto: "",
  });

  // Logo state — reads from localStorage on first render
  const [logoPreview, setLogoPreview] = useState<string | null>(() =>
    localStorage.getItem("classio_school_logo"),
  );
  const logoInputRef = useRef<HTMLInputElement>(null);

  const canManageLogo = ["schooladmin", "admin", "superadmin", "hr"].includes(
    user?.role ?? "",
  );

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      localStorage.setItem("classio_school_logo", dataUrl);
      setLogoPreview(dataUrl);
      toast.success("School logo updated");
    };
    reader.readAsDataURL(file);
    // Reset file input so the same file can be re-selected
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    localStorage.removeItem("classio_school_logo");
    setLogoPreview(null);
    toast.success("Logo removed. Default logo restored.");
  };

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

  const copyUsername = () => {
    navigator.clipboard.writeText(user?.username ?? "");
    toast.success("Username copied");
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  data-ocid="settings.profile.name.input"
                  value={user?.name ?? ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={user?.role ?? "—"}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <div className="flex gap-2">
                  <Input
                    data-ocid="settings.principal.input"
                    value={user?.username ?? ""}
                    readOnly
                    className="font-mono text-xs bg-muted"
                  />
                  <Button
                    data-ocid="settings.copy.button"
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyUsername}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your login username for Classio ERP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Logo — only for admin roles */}
        {canManageLogo && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" /> School Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Logo will appear in the sidebar, login page, and salary slips.
                </p>

                {/* Current Logo Preview */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      data-ocid="settings.logo.card"
                      src={logoPreview ?? DEFAULT_LOGO}
                      alt="School Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium">
                      {logoPreview
                        ? "Custom logo active"
                        : "Default Classio logo"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        data-ocid="settings.logo.upload_button"
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        className="gap-1.5"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                        Upload Logo
                      </Button>
                      {logoPreview && (
                        <Button
                          data-ocid="settings.logo.delete_button"
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="gap-1.5 text-destructive hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove Logo
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: PNG, JPG, SVG, WebP (max 2 MB)
                    </p>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </CardContent>
          </Card>
        )}

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
