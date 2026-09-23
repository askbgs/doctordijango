"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import type { ApiResponse, PaginatedResponse, PatientProfile } from "@/types";

export default function PatientsPage() {
  const { currentOrg } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<PatientProfile>>>("/patients/");
      return res.data.data;
    },
    enabled: !!currentOrg && currentOrg.role !== "PATIENT",
  });

  const patients: PatientProfile[] = data?.results || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Patients</h1>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="px-6 py-8 text-center text-gray-500">Loading...</p>
          ) : patients.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No patients found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Phone</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Gender</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Blood Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{p.patient_name}</td>
                      <td className="px-6 py-4 text-gray-600">{p.email}</td>
                      <td className="px-6 py-4 text-gray-600">{p.phone || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{p.gender || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{p.blood_group || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
