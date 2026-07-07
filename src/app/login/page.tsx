"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { validateEmail, validatePassword } from "@/lib/auth/validation";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const e = validateEmail(email);
    if (e) newErrors.email = e;
    const p = validatePassword(password);
    if (p) newErrors.password = p;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validate()) return;
    setLoading(true);
    const ok = await login(email, password);
    if (ok) {
      router.push("/");
    } else {
      setErrors({ form: "Invalid email or password. Please try again." });
    }
    setLoading(false);
  };

  const mockLoginAsUser = () => {
    const user = { id: "user-001", name: "Demo User", email: "demo@example.com" };
    localStorage.setItem("brd_auth_user", JSON.stringify(user));
    localStorage.removeItem("brd-admin-auth");
    window.location.href = "/";
  };

  const mockLoginAsAdmin = () => {
    const user = { id: "user-001", name: "Admin User", email: "admin@example.com" };
    localStorage.setItem("brd_auth_user", JSON.stringify(user));
    localStorage.setItem("brd-admin-auth", "authenticated");
    window.location.href = "/admin";
  };

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-auto px-4">
        {/* ── Logo + Title ── */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <span className="relative text-white text-xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Sign in to your BRD Task Forge account</p>
        </div>

        {/* ── Card ── */}
        <div className="glass-raised rounded-2xl p-7 relative overflow-hidden">
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {errors.form && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="7" /><path d="M8 5v3.5M8 11h.01" />
                </svg>
                {errors.form}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setTouched((p) => ({ ...p, email: true })); }}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="name@example.com"
                className={`w-full rounded-xl border bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                  touched.email && errors.email
                    ? "border-red-500/40 focus:ring-red-500/30"
                    : "border-white/8 focus:ring-blue-500/40 focus:border-blue-500/40"
                }`}
                autoFocus
              />
              {touched.email && errors.email && (
                <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setTouched((p) => ({ ...p, password: true })); }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                  touched.password && errors.password
                    ? "border-red-500/40 focus:ring-red-500/30"
                    : "border-white/8 focus:ring-blue-500/40 focus:border-blue-500/40"
                }`}
              />
              {touched.password && errors.password && (
                <p className="text-[10px] text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full btn-primary-gradient rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* ── Dev Quick Access ── */}
        <div className="mt-6 pt-5 border-t border-white/6">
          <p className="text-[10px] text-muted-foreground/60 text-center mb-3 uppercase tracking-widest font-semibold">
            Development · Quick Access
          </p>
          <div className="flex flex-col gap-2">
            <button
              id="mock-login-user"
              onClick={mockLoginAsUser}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/6 hover:border-white/15 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" /><path d="M14 14c0-2-2.7-4-6-4s-6 2-6 4" />
              </svg>
              Sign in as <strong>User</strong>
            </button>
            <button
              id="mock-login-admin"
              onClick={mockLoginAsAdmin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/35 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8a4 4 0 11-8 0 4 4 0 018 0z" />
                <path d="M8 2v2" /><path d="M8 12v2" /><path d="M2 8h2" /><path d="M12 8h2" />
              </svg>
              Sign in as <strong>Admin</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
