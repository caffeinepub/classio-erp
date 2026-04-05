import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

function LoginScreen() {
  const { login } = useLocalAuth();
  const schoolLogo =
    localStorage.getItem("classio_school_logo") ||
    "/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        setError(result.error ?? "Login failed");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Tile — Brand / Hero Panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center justify-center md:w-[45%] min-h-[280px] md:min-h-screen overflow-hidden"
        style={{ background: "#060B14" }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #00CCFF 0%, #009FD6 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, #009FD6 0%, #00CCFF 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-1/2 left-[10%] w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #00CCFF 0%, transparent 70%)",
          }}
        />
        {/* Decorative ring */}
        <div
          className="absolute bottom-[15%] left-[8%] w-20 h-20 rounded-full border-2 opacity-20 pointer-events-none"
          style={{ borderColor: "#00CCFF" }}
        />
        <div
          className="absolute top-[12%] right-[10%] w-12 h-12 rounded-full border opacity-15 pointer-events-none"
          style={{ borderColor: "#009FD6" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-8 py-12">
          {/* Logo with glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-8"
          >
            <div
              className="absolute inset-0 rounded-2xl blur-2xl scale-125 opacity-50"
              style={{
                background:
                  "radial-gradient(circle, #00CCFF 0%, #009FD6 60%, transparent 100%)",
              }}
            />
            <img
              src={schoolLogo}
              alt="Classio ERP"
              className="relative w-28 h-28 rounded-2xl object-cover"
              style={{
                boxShadow:
                  "0 0 32px 4px rgba(0,204,255,0.35), 0 0 0 2px rgba(0,204,255,0.18)",
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1
              className="text-4xl font-bold mb-2 tracking-tight"
              style={{ color: "#FFFFFF" }}
            >
              Classio
              <span
                className="block text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #00CCFF, #009FD6)",
                }}
              >
                ERP
              </span>
            </h1>
            <p
              className="text-base font-medium mb-8"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              School Management System
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col gap-3 w-full max-w-[220px]"
          >
            {[
              { icon: GraduationCap, label: "Student Management" },
              { icon: Users, label: "HR & Staff Portal" },
              { icon: BookOpen, label: "Learning & Admissions" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-full px-4 py-2"
                style={{
                  background: "rgba(0,204,255,0.08)",
                  border: "1px solid rgba(0,204,255,0.18)",
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "#00CCFF" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom gradient line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, #00CCFF, #009FD6)" }}
        />
      </motion.div>

      {/* Right Tile — Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center md:w-[55%] min-h-screen bg-white px-6 py-12"
      >
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: "#060B14" }}
            >
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Sign in to your Classio ERP account
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-sm font-semibold"
                style={{ color: "#374151" }}
              >
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
                className="h-11 text-sm"
                style={{
                  borderColor: "#E5E7EB",
                  background: "#F9FAFB",
                  color: "#111827",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-semibold"
                style={{ color: "#374151" }}
              >
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
                  className="h-11 pr-10 text-sm"
                  style={{
                    borderColor: "#E5E7EB",
                    background: "#F9FAFB",
                    color: "#111827",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#9CA3AF" }}
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
              <div
                data-ocid="login.error_state"
                className="rounded-lg px-4 py-3 text-sm text-center"
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}

            <Button
              data-ocid="login.primary_button"
              type="submit"
              className="w-full h-11 text-white font-semibold text-sm rounded-lg transition-opacity hover:opacity-90 border-0"
              style={{
                background: "linear-gradient(90deg, #00CCFF 0%, #009FD6 100%)",
                boxShadow: "0 4px 14px rgba(0,204,255,0.3)",
              }}
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
          </form>

          {/* Role hint */}
          <div
            className="mt-6 rounded-xl px-4 py-3 text-xs text-center"
            style={{
              background: "#F0FDFE",
              border: "1px solid #BAE6FD",
              color: "#0369A1",
            }}
          >
            <span className="font-semibold">Super Admin:</span> admin / admin123
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs" style={{ color: "#9CA3AF" }}>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80 transition-opacity"
            style={{ color: "#009FD6" }}
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isInitializing, isAuthenticated } = useLocalAuth();

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#060B14" }}
      >
        <div className="text-center">
          <Loader2
            className="h-10 w-10 animate-spin mx-auto mb-3"
            style={{ color: "#00CCFF" }}
          />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Loading Classio ERP...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
