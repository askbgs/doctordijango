"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import type { ApiResponse, Department, PaginatedResponse } from "@/types";

export default function DepartmentsPage() {
  const { currentOrg } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Department>>>("/organizations/departments/");
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const departments: Department[] = data?.results || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Departments</h1>
      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : departments.length === 0 ? (
        <p className="text-center text-gray-500">No departments found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <LayoutGrid className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    {dept.description && <p className="mt-1 text-sm text-gray-500">{dept.description}</p>}
                    <div className="mt-2">
                      <Badge variant={dept.active ? "success" : "default"}>
                        {dept.active ? "Active" : "Inactive"}
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
