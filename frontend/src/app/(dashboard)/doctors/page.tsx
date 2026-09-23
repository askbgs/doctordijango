"use client";

import { useQuery } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { getDoctors } from "@/services/doctors";
import type { DoctorProfile } from "@/types";

export default function DoctorsPage() {
  const { currentOrg } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getDoctors(),
    enabled: !!currentOrg,
  });

  const doctors: DoctorProfile[] = data?.results || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <p className="mt-1 text-gray-600">Browse and manage doctors</p>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doctor.doctor_name}</h3>
                    <p className="text-sm text-blue-600">{doctor.specialization}</p>
                    {doctor.department_name && (
                      <p className="text-sm text-gray-500">{doctor.department_name}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="info">{doctor.experience_years} yrs exp</Badge>
                      <Badge>{doctor.consultation_fee}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/book?doctor=${doctor.id}`}
                    className="block w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Book Appointment
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
