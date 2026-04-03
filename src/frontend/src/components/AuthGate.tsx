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
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

const ROLE_CARDS = [
  {
    icon: ShieldCheck,
    role: "Super Admin",
    description: "Full system access, manage school admins and global settings",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  {
    icon: Building2,
    role: "School Admin",
    description: "Manage students, staff, and all school operations",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    icon: GraduationCap,
    role: "Teacher",
    description: "Manage classes, assign grades, and publish LMS courses",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  {
    icon: UserCog,
    role: "HR Manager",
    description: "Handle payroll, staff records, and leave management",
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  {
    icon: Users,
    role: "Student",
    description: "Access courses, view grades, and read announcements",
    color: "text-cyan-600",
    bg: "bg-cyan-50 border-cyan-200",
  },
];

function LoginScreen() {
  const { login } = useLocalAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }
    setIsLoading(true);
    // Small timeout to show loading state
    setTimeout(() => {
      const result = login(username.trim(), password);
      if (!result.success) {
        setError(result.error ?? "Login failed");
        setIsLoading(false);
      }
      // If success, the provider state update will re-render and exit login screen
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
            alt="Classio ERP"
            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
          />
          <div>
            <span className="text-slate-800 font-bold text-lg leading-none">
              Classio ERP
            </span>
            <p className="text-slate-400 text-xs mt-0.5">
              School Management System
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 pt-10 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 max-w-2xl"
        >
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-200/60 blur-2xl scale-110" />
              <img
                src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
                alt="Classio ERP"
                className="relative w-20 h-20 rounded-2xl object-cover border-2 border-blue-200 shadow-lg"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3 tracking-tight">
            Welcome to <span className="text-blue-600">Classio ERP</span>
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            A comprehensive school management platform for administrators,
            teachers, HR teams, and students.
          </p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-4xl mb-8"
        >
          <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Who uses Classio ERP
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLE_CARDS.map((card, i) => (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
                className={`rounded-xl border p-4 ${card.bg} flex items-start gap-3`}
              >
                <div className={`mt-0.5 shrink-0 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${card.color}`}>
                    {card.role}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="w-full max-w-sm"
        >
          <Card className="shadow-lg border border-slate-200 bg-white">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-slate-800 text-xl">Sign In</CardTitle>
              <CardDescription className="text-slate-500">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-slate-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    data-ocid="login.username_input"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      data-ocid="login.password_input"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p
                    className="text-red-500 text-sm text-center"
                    data-ocid="login.error_state"
                  >
                    {error}
                  </p>
                )}

                <Button
                  data-ocid="login.primary_button"
                  type="submit"
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <p className="text-center text-slate-400 text-xs">
                  Default superadmin:{" "}
                  <span className="font-mono text-slate-600">admin</span> /
                  <span className="font-mono text-slate-600"> admin123</span>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-slate-400 text-xs border-t border-slate-200 bg-white/60">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          className="underline hover:text-slate-600 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isInitializing, isAuthenticated } = useLocalAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading Classio ERP...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
