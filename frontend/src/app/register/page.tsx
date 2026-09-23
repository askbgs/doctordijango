"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  Calendar,
  Users,
  Shield,
  Zap,
} from "lucide-react";

const plans = [
  { name: "Free", price: "$0", period: "/month", features: ["1 Branch", "Up to 5 doctors", "100 appointments/month"], highlighted: false },
  { name: "Professional", price: "$49", period: "/month", features: ["5 Branches", "Unlimited doctors", "Unlimited appointments", "Priority support"], highlighted: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited branches", "Custom integrations", "Dedicated account manager", "SLA guarantee"], highlighted: false },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "", first_name: "", last_name: "", phone: "",
    password: "", password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.first_name || !form.last_name || !form.email) {
      setError("Please fill in all required fields.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (score === 3) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-emerald-500" };
  })();

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-20 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        <div className="relative z-10 p-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DoctorDjango</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Start managing your<br />
            <span className="text-emerald-200">practice for free</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/70">
            Join 500+ healthcare providers who trust DoctorDjango for their appointment management.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Zap, text: "Set up in under 5 minutes" },
              { icon: Calendar, text: "Start booking immediately" },
              { icon: Users, text: "Invite your whole team" },
              { icon: Shield, text: "No credit card required" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <item.icon className="h-5 w-5 text-emerald-200" />
                </div>
                <span className="text-sm font-medium text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-12">
          <div className="grid grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-4 ${
                  plan.highlighted
                    ? "border border-emerald-300/30 bg-white/15 backdrop-blur-md"
                    : "border border-white/10 bg-white/5 backdrop-blur-md"
                }`}
              >
                <div className="text-xs font-semibold text-white/60">{plan.name}</div>
                <div className="mt-1 text-xl font-bold text-white">
                  {plan.price}<span className="text-sm font-normal text-white/50">{plan.period}</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-white/70">
                      <Check className="h-3 w-3 text-emerald-300" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-8 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-2 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">DoctorDjango</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h1>
            <p className="mt-2 text-base text-gray-500">
              {step === 1 ? "Tell us about yourself to get started" : "Set your password to secure your account"}
            </p>
          </div>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-gray-900" : "text-gray-400"}`}>
                Your info
              </span>
            </div>
            <div className={`h-px flex-1 ${step > 1 ? "bg-emerald-600" : "bg-gray-200"}`} />
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? "text-gray-900" : "text-gray-400"}`}>
                Password
              </span>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <span className="text-sm text-red-600">!</span>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                    <input
                      id="first_name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                    <input
                      id="last_name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl"
              >
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <span className="text-sm text-red-600">!</span>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {form.first_name[0]}{form.last_name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{form.first_name} {form.last_name}</div>
                    <div className="text-xs text-gray-500">{form.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="ml-auto text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    required
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i <= passwordStrength.level ? passwordStrength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength.level <= 1 ? "text-red-600" :
                      passwordStrength.level === 2 ? "text-yellow-600" :
                      passwordStrength.level === 3 ? "text-blue-600" : "text-emerald-600"
                    }`}>
                      {passwordStrength.label} password
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type={showPassword ? "text" : "password"}
                    value={form.password_confirm}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                    className={`h-12 w-full rounded-xl border bg-gray-50 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
                      form.password_confirm && form.password_confirm !== form.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : form.password_confirm && form.password_confirm === form.password
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/10"
                    }`}
                  />
                  {form.password_confirm && form.password_confirm === form.password && (
                    <Check className="absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-all hover:bg-gray-50"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            By creating an account, you agree to our{" "}
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
