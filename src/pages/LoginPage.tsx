import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { useToastContext } from "@/contexts/ToastContext";

export default function LoginPage() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const { showError, showSuccess } = useToastContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login({ email: email.trim(), password });
      showSuccess("Welcome back!", "You have successfully logged in.");
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      showError("Login failed", message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-fuchsia-950/30 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#E9488A]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F3B44C]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E9488A]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 border border-white/20 p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/images/Desi_logo.png"
              alt="Desi Campaign"
              className="h-14 w-auto object-contain"
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              Sign in to access your campaign dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
              className="focus:ring-[#E9488A] focus:border-[#E9488A]"
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              className="focus:ring-[#E9488A] focus:border-[#E9488A]"
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Unauthorized access will redirect you here. Please sign in to
            continue.
          </p>
        </div>
      </div>
    </div>
  );
}
