import api from "@/lib/api";
import type { Appointment, ApiResponse, PaginatedResponse, TimeSlot } from "@/types";

export async function getAppointments(params?: Record<string, string>) {
  const res = await api.get<ApiResponse<PaginatedResponse<Appointment>>>("/appointments/", { params });
  return res.data.data;
}

export async function getAppointment(id: string) {
  const res = await api.get<ApiResponse<Appointment>>(`/appointments/${id}/`);
  return res.data.data;
}

export async function bookAppointment(data: {
  doctor_id: string;
  branch_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type?: string;
  reason?: string;
}) {
  const res = await api.post<ApiResponse<Appointment>>("/appointments/book/", data);
  return res.data.data;
}

export async function getAvailableSlots(doctorId: string, branchId: string, date: string) {
  const res = await api.get<ApiResponse<TimeSlot[]>>("/appointments/availability/", {
    params: { doctor_id: doctorId, branch_id: branchId, date },
  });
  return res.data.data;
}

export async function confirmAppointment(id: string) {
  const res = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/confirm/`);
  return res.data.data;
}

export async function cancelAppointment(id: string, reason?: string) {
  const res = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/cancel/`, {
    cancellation_reason: reason || "",
  });
  return res.data.data;
}

export async function checkInAppointment(id: string) {
  const res = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/check-in/`);
  return res.data.data;
}

export async function completeAppointment(id: string) {
  const res = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/complete/`);
  return res.data.data;
}
