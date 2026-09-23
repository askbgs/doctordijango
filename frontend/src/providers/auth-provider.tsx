"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Membership, User } from "@/types";

interface AuthContextType {
  user: User | null;
  organizations: Membership[];
  currentOrg: Membership | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  selectOrganization: (orgId: string) => void;
}

interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Membership[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedOrgs = localStorage.getItem("organizations");
      const savedOrgId = localStorage.getItem("organizationId");
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedOrgs) {
        const orgs: Membership[] = JSON.parse(savedOrgs);
        setOrganizations(orgs);
        if (savedOrgId) {
          setCurrentOrg(orgs.find((o) => o.organization_id === savedOrgId) || orgs[0] || null);
        } else if (orgs.length > 0) {
          setCurrentOrg(orgs[0]);
          localStorage.setItem("organizationId", orgs[0].organization_id);
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/auth/login/", { email, password });
    const data = res.data.data;
    localStorage.setItem("tokens", JSON.stringify({ access: data.access, refresh: data.refresh }));
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("organizations", JSON.stringify(data.organizations || []));
    setUser(data.user);
    const orgs: Membership[] = data.organizations || [];
    setOrganizations(orgs);
    if (orgs.length > 0) {
      setCurrentOrg(orgs[0]);
      localStorage.setItem("organizationId", orgs[0].organization_id);
    }
    router.push("/dashboard");
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post("/auth/register/", data);
    const result = res.data.data;
    localStorage.setItem("tokens", JSON.stringify(result.tokens));
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      const { refresh } = JSON.parse(tokens);
      api.post("/auth/logout/", { refresh }).catch(() => {});
    }
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
    localStorage.removeItem("organizations");
    localStorage.removeItem("organizationId");
    setUser(null);
    setOrganizations([]);
    setCurrentOrg(null);
    router.push("/login");
  }, [router]);

  const selectOrganization = useCallback((orgId: string) => {
    const org = organizations.find((o) => o.organization_id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("organizationId", orgId);
    }
  }, [organizations]);

  return (
    <AuthContext.Provider value={{ user, organizations, currentOrg, loading, login, register, logout, selectOrganization }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
