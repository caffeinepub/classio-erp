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
  Building2,
  GraduationCap,
  Loader2,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useSaveUserProfile } from "../hooks/useQueries";

const ROLE_CARDS = [
  {
    icon: ShieldCheck,
    role: "Super Admin",
    description: "Full system access, manage school admins and global settings",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/30",
  },
  {
    icon: Building2,
    role: "School Admin",
    description: "Manage students, staff, and all school operations",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/30",
  },
  {
    icon: GraduationCap,
    role: "Teacher",
    description: "Manage classes, assign grades, and publish LMS courses",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/30",
  },
  {
    icon: UserCog,
    role: "HR Manager",
    description: "Handle payroll, staff records, and leave management",
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/30",
  },
  {
    icon: Users,
    role: "Student",
    description: "Access courses, view grades, and read announcements",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/30",
  },
];

function LoginScreen() {
  const { login, loginStatus, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-sidebar flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-sidebar-border/30">
        <div className="flex items-center gap-3">
          <img
            src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
            alt="Classio ERP"
            className="w-10 h-10 rounded-lg object-cover border border-sidebar-border/40"
          />
          <div>
            <span className="text-sidebar-foreground font-bold text-lg leading-none">
              Classio ERP
            </span>
            <p className="text-sidebar-foreground/50 text-xs mt-0.5">
              School Management System
            </p>
          </div>
        </div>
        <Button
          data-ocid="login.primary_button"
          onClick={login}
          disabled={isLoggingIn}
          className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
          size="sm"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-sidebar-primary/30 blur-2xl scale-110" />
              <img
                src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
                alt="Classio ERP"
                className="relative w-24 h-24 rounded-2xl object-cover border-2 border-sidebar-primary/50 shadow-xl"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-sidebar-foreground mb-4 tracking-tight">
            Welcome to <span className="text-sidebar-primary">Classio ERP</span>
          </h1>
          <p className="text-sidebar-foreground/60 text-lg max-w-xl mx-auto">
            A comprehensive school management platform for administrators,
            teachers, HR teams, and students.
          </p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-4xl mb-10"
        >
          <p className="text-center text-sidebar-foreground/50 text-sm font-medium uppercase tracking-widest mb-5">
            Who uses Classio ERP
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLE_CARDS.map((card, i) => (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                className={`rounded-xl border p-4 ${card.bg} flex items-start gap-3`}
              >
                <div className={`mt-0.5 shrink-0 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${card.color}`}>
                    {card.role}
                  </h3>
                  <p className="text-sidebar-foreground/55 text-xs mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sign-in Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="w-full max-w-sm"
        >
          <Card className="shadow-xl border border-sidebar-border/30 bg-white/5 backdrop-blur-sm">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-sidebar-foreground text-xl">
                Sign In to Your Account
              </CardTitle>
              <CardDescription className="text-sidebar-foreground/55">
                Use Internet Identity to securely access your role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                data-ocid="login.primary_button"
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground h-11 font-semibold"
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
              <p className="text-center text-sidebar-foreground/40 text-xs">
                Your identity is secured by the Internet Computer
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sidebar-foreground/30 text-xs border-t border-sidebar-border/20">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          className="underline hover:text-sidebar-foreground/60 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
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
