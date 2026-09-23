import api from "@/lib/api";
import type { ApiResponse, DoctorProfile, PaginatedResponse } from "@/types";

export async function getDoctors(params?: Record<string, string>) {
  const res = await api.get<ApiResponse<PaginatedResponse<DoctorProfile>>>("/doctors/", { params });
  return res.data.data;
}

export async function getDoctor(id: string) {
  const res = await api.get<ApiResponse<DoctorProfile>>(`/doctors/${id}/`);
  return res.data.data;
}

export async function getPublicDoctors(params?: Record<string, string>) {
  const res = await api.get<ApiResponse<PaginatedResponse<DoctorProfile>>>("/public/doctors/", { params });
  return res.data.data;
}

export async function getPublicDoctor(id: string) {
  const res = await api.get<ApiResponse<DoctorProfile>>(`/public/doctors/${id}/`);
  return res.data.data;
}
