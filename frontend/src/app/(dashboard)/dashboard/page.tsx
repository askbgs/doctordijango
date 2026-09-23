"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { getAppointments } from "@/services/appointments";
import type { Appointment } from "@/types";

export default function DashboardPage() {
  const { user, currentOrg } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const { data } = useQuery({
    queryKey: ["appointments", "today", today],
    queryFn: () => getAppointments({ appointment_date: today }),
    enabled: !!currentOrg,
  });

  const appointments = data?.results || [];
  const pending = appointments.filter((a: Appointment) => a.status === "PENDING").length;
  const confirmed = appointments.filter((a: Appointment) => a.status === "CONFIRMED").length;
  const completed = appointments.filter((a: Appointment) => a.status === "COMPLETED").length;
  const cancelled = appointments.filter((a: Appointment) => a.status === "CANCELLED").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}
        </h1>
        <p className="mt-1 text-gray-600">
          {currentOrg ? currentOrg.organization_name : "Select an organization to get started"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label="Today's Appointments" value={appointments.length} color="blue" />
        <StatCard icon={Clock} label="Pending" value={pending} color="yellow" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} color="green" />
        <StatCard icon={XCircle} label="Cancelled" value={cancelled} color="red" />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Appointments</h2>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No appointments for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Reference</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">
                      {currentOrg?.role === "PATIENT" ? "Doctor" : "Patient"}
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((apt: Appointment) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {apt.start_time} - {apt.end_time}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{apt.reference}</td>
                      <td className="px-6 py-4 text-gray-900">
                        {currentOrg?.role === "PATIENT" ? apt.doctor_name : apt.patient_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{apt.appointment_type}</td>
                      <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
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

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
