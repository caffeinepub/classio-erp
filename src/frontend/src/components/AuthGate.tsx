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
  BarChart3,
  BookOpen,
  GraduationCap,
  Loader2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useSaveUserProfile } from "../hooks/useQueries";

function LoginScreen() {
  const { login, loginStatus, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/20 rounded-2xl p-4">
              <img
                src="/assets/generated/classio-logo-transparent.dim_120x120.png"
                alt="Classio ERP"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-sidebar-foreground">
            Classio ERP
          </h1>
          <p className="text-sidebar-foreground/60 mt-1 text-sm">
            School Management System
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to access your school management
              system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              data-ocid="login.primary_button"
              onClick={login}
              disabled={isLoggingIn}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In with Internet Identity</>
              )}
            </Button>
            {loginStatus === "loginError" && (
              <p
                className="text-destructive text-sm text-center"
                data-ocid="login.error_state"
              >
                Login failed. Please try again.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: Users, label: "Student Management" },
            { icon: GraduationCap, label: "Grade Tracking" },
            { icon: BookOpen, label: "LMS Courses" },
            { icon: BarChart3, label: "HR & Payroll" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-sidebar-accent/50 rounded-lg px-3 py-2"
            >
              <Icon className="h-4 w-4 text-sidebar-primary shrink-0" />
              <span className="text-xs text-sidebar-foreground/70 font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ProfileSetupModal({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [name, setName] = useState("");
  const saveProfile = useSaveUserProfile();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      await saveProfile.mutateAsync({ name: name.trim(), role: "user" });
      onComplete();
    },
    [name, saveProfile, onComplete],
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm px-4"
      >
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Set Up Your Profile</CardTitle>
            <CardDescription>
              Tell us your name to get started with Classio ERP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  data-ocid="profile.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                  required
                />
              </div>
              <Button
                data-ocid="profile.submit_button"
                type="submit"
                className="w-full"
                disabled={saveProfile.isPending || !name.trim()}
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Continue to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useCallerUserProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary mx-auto mb-3" />
          <p className="text-sidebar-foreground/60 text-sm">
            Loading Classio ERP...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary mx-auto mb-3" />
          <p className="text-sidebar-foreground/60 text-sm">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetupModal onComplete={() => {}} />;
  }

  return <>{children}</>;
}
