"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "", first_name: "", last_name: "", phone: "",
    password: "", password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">DoctorDjango</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input id="first_name" label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
              <Input id="last_name" label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
            </div>
            <Input id="email" label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Input id="phone" label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
            <Input id="password" label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            <Input id="password_confirm" label="Confirm Password" name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
