"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import type { ApiResponse, Branch, PaginatedResponse } from "@/types";

export default function BranchesPage() {
  const { currentOrg } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Branch>>>("/organizations/branches/");
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const branches: Branch[] = data?.results || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Branches</h1>
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : branches.length === 0 ? (
        <p className="text-center text-gray-500">No branches found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card key={branch.id}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-500">{branch.city}</p>
                    {branch.code && <p className="text-xs text-gray-400">Code: {branch.code}</p>}
                    <div className="mt-2">
                      <Badge variant={branch.active ? "success" : "default"}>
                        {branch.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
