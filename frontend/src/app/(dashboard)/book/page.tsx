"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { bookAppointment, getAvailableSlots } from "@/services/appointments";
import { getDoctors } from "@/services/doctors";
import api from "@/lib/api";
import type { Branch, DoctorProfile, TimeSlot, ApiResponse, PaginatedResponse } from "@/types";

export default function BookAppointmentPage() {
  const { currentOrg } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [doctorId, setDoctorId] = useState(searchParams.get("doctor") || "");
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [appointmentType, setAppointmentType] = useState("IN_PERSON");
  const [error, setError] = useState("");

  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
    enabled: !!currentOrg,
  });

  const { data: branchesData } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<Branch>>>("/organizations/branches/");
      return res.data.data;
    },
    enabled: !!currentOrg,
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", doctorId, branchId, date],
    queryFn: () => getAvailableSlots(doctorId, branchId, date),
    enabled: !!doctorId && !!branchId && !!date,
  });

  const booking = useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.push("/appointments");
    },
    onError: () => setError("Booking failed. The slot may no longer be available."),
  });

  const handleBook = () => {
    if (!selectedSlot || !doctorId || !branchId || !date) return;
    setError("");
    booking.mutate({
      doctor_id: doctorId,
      branch_id: branchId,
      appointment_date: date,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      appointment_type: appointmentType,
      reason,
    });
  };

  const doctors: DoctorProfile[] = doctorsData?.results || [];
  const branches: Branch[] = branchesData?.results || [];
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Book Appointment</h1>

      <Card>
        <CardContent className="space-y-6">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor</label>
            <select
              value={doctorId}
              onChange={(e) => { setDoctorId(e.target.value); setSelectedSlot(null); }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.doctor_name} - {d.specialization}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
            <select
              value={branchId}
              onChange={(e) => { setBranchId(e.target.value); setSelectedSlot(null); }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select a branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} - {b.city}</option>
              ))}
            </select>
          </div>

          <Input
            id="date"
            label="Date"
            type="date"
            value={date}
            min={today}
            onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); }}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Type</label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="IN_PERSON">In Person</option>
              <option value="VIDEO">Video Call</option>
              <option value="PHONE">Phone Call</option>
            </select>
          </div>

          {doctorId && branchId && date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
              {slotsLoading ? (
                <p className="text-sm text-gray-500">Loading slots...</p>
              ) : !slots || slots.length === 0 ? (
                <p className="text-sm text-gray-500">No slots available for this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot: TimeSlot) => (
                    <button
                      key={slot.start_time}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        selectedSlot?.start_time === slot.start_time
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {slot.start_time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Input
            id="reason"
            label="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Brief reason for visit"
          />

          <Button
            onClick={handleBook}
            className="w-full"
            size="lg"
            disabled={!selectedSlot || booking.isPending}
          >
            {booking.isPending ? "Booking..." : "Confirm Booking"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
