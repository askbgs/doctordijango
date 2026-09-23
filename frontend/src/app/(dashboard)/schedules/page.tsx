"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Schedule } from "@/types";

export default function SchedulesPage() {
  const { currentOrg } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Schedule>>>("/schedules/");
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const schedules: Schedule[] = data?.results || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Schedules</h1>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="px-6 py-8 text-center text-gray-500">Loading...</p>
          ) : schedules.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No schedules found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Doctor</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Branch</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Day</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Slot Duration</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{s.doctor_name}</td>
                      <td className="px-6 py-4 text-gray-600">{s.branch_name}</td>
                      <td className="px-6 py-4 text-gray-600">{s.weekday_display}</td>
                      <td className="px-6 py-4 text-gray-600">{s.start_time} - {s.end_time}</td>
                      <td className="px-6 py-4 text-gray-600">{s.slot_duration} min</td>
                      <td className="px-6 py-4">
                        <Badge variant={s.active ? "success" : "default"}>
                          {s.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
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
