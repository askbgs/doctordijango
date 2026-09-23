"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import {
  cancelAppointment, checkInAppointment, completeAppointment,
  confirmAppointment, getAppointments,
} from "@/services/appointments";
import type { Appointment } from "@/types";

export default function AppointmentsPage() {
  const { currentOrg } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => getAppointments(),
    enabled: !!currentOrg,
  });

  const confirm = useMutation({
    mutationFn: confirmAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const checkIn = useMutation({
    mutationFn: checkInAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const complete = useMutation({
    mutationFn: completeAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const appointments: Appointment[] = data?.results || [];
  const isStaff = currentOrg?.role !== "PATIENT";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="px-6 py-8 text-center text-gray-500">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No appointments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Reference</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">
                      {isStaff ? "Patient" : "Doctor"}
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{apt.reference}</td>
                      <td className="px-6 py-4 text-gray-600">{apt.appointment_date}</td>
                      <td className="px-6 py-4 text-gray-600">{apt.start_time} - {apt.end_time}</td>
                      <td className="px-6 py-4 text-gray-900">{isStaff ? apt.patient_name : apt.doctor_name}</td>
                      <td className="px-6 py-4 text-gray-600">{apt.appointment_type.replace("_", " ")}</td>
                      <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {apt.status === "PENDING" && (
                            <>
                              <Button size="sm" onClick={() => confirm.mutate(apt.id)}>Confirm</Button>
                              <Button size="sm" variant="destructive" onClick={() => cancel.mutate(apt.id)}>Cancel</Button>
                            </>
                          )}
                          {apt.status === "CONFIRMED" && isStaff && (
                            <Button size="sm" onClick={() => checkIn.mutate(apt.id)}>Check In</Button>
                          )}
                          {apt.status === "CHECKED_IN" && isStaff && (
                            <Button size="sm" onClick={() => complete.mutate(apt.id)}>Complete</Button>
                          )}
                          {["PENDING", "CONFIRMED"].includes(apt.status) && !isStaff && (
                            <Button size="sm" variant="destructive" onClick={() => cancel.mutate(apt.id)}>Cancel</Button>
                          )}
                        </div>
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
