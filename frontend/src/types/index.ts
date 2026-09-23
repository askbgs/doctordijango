export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  profile_image?: string;
  is_verified: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  status: string;
}

export interface Branch {
  id: string;
  organization: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  timezone: string;
  active: boolean;
}

export interface Department {
  id: string;
  organization: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Membership {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  role: string;
}

export interface DoctorProfile {
  id: string;
  user: string;
  doctor_name: string;
  email: string;
  organization: string;
  organization_name?: string;
  department: string;
  department_name?: string;
  specialization: string;
  qualification: string;
  biography: string;
  consultation_fee: string;
  experience_years: number;
  languages: string[];
  profile_image?: string;
  active: boolean;
  verified: boolean;
}

export interface PatientProfile {
  id: string;
  user: string;
  patient_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender: string;
  blood_group: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
}

export interface Appointment {
  id: string;
  reference: string;
  organization: string;
  branch: string;
  branch_name: string;
  doctor: string;
  doctor_name: string;
  patient: string;
  patient_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  status: string;
  status_display: string;
  booking_source: string;
  reason: string;
  notes: string;
  cancellation_reason: string;
  created_at: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  duration: number;
}

export interface Schedule {
  id: string;
  doctor: string;
  doctor_name: string;
  branch: string;
  branch_name: string;
  weekday: number;
  weekday_display: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  break_start?: string;
  break_end?: string;
  active: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
