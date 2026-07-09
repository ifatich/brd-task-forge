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
    <div className="flex flex-col flex-1 items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">

        {/* ── Logo + Title ── */}
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[24px] mb-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-ink" />
            <span className="relative text-canvas text-base font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Welcome Back</h1>
          <p className="text-sm text-ink/50 mt-1.5">Sign in to your BRD Task Forge account</p>
        </div>

        {/* ── Form Card ── */}
        <div className="rounded-[24px] border border-hairline bg-canvas p-7">

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Form error */}
            {errors.form && (
              <div className="rounded-[12px] bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="7" /><path d="M8 5v3.5M8 11h.01" />
                </svg>
                {errors.form}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-[11px] font-semibold text-ink/50 uppercase tracking-wider block">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setTouched((p) => ({ ...p, email: true })); }}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="name@example.com"
                className={`w-full rounded-[12px] border px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 bg-canvas focus:outline-none focus:ring-2 transition-all ${
                  touched.email && errors.email
                    ? "border-red-300 focus:ring-red-200"
                    : "border-hairline focus:ring-ink/10 focus:border-ink/30"
                }`}
                autoFocus
              />
              {touched.email && errors.email && (
                <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-[11px] font-semibold text-ink/50 uppercase tracking-wider block">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setTouched((p) => ({ ...p, password: true })); }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={`w-full rounded-[12px] border px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 bg-canvas focus:outline-none focus:ring-2 transition-all ${
                  touched.password && errors.password
                    ? "border-red-300 focus:ring-red-200"
                    : "border-hairline focus:ring-ink/10 focus:border-ink/30"
                }`}
              />
              {touched.password && errors.password && (
                <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-canvas hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* ── Dev Quick Access ── */}
        <div className="mt-6 pt-5 border-t border-hairline">
          <p className="text-[10px] text-ink/40 text-center mb-3 uppercase tracking-widest font-semibold">
            Development · Quick Access
          </p>
          <div className="flex flex-col gap-2">
            <button
              id="mock-login-user"
              onClick={mockLoginAsUser}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-hairline bg-canvas px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" /><path d="M14 14c0-2-2.7-4-6-4s-6 2-6 4" />
              </svg>
              Sign in as <strong>User</strong>
            </button>
            <button
              id="mock-login-admin"
              onClick={mockLoginAsAdmin}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-hairline bg-surface-soft px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-black/5 transition-colors"
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
