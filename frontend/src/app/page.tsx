import Link from "next/link";
import { Calendar, Shield, Clock, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-bold text-blue-600">DoctorDjango</h1>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Modern Doctor Appointment
              <span className="block text-blue-600">Booking Platform</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Streamline your clinic operations with our comprehensive appointment
              management system. Built for doctors, clinics, and patients.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Start Free Trial
              </Link>
              <Link
                href="/doctors"
                className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Browse Doctors
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Calendar, title: "Easy Booking", desc: "Book appointments online in seconds with real-time availability." },
                { icon: Clock, title: "Smart Scheduling", desc: "Automated scheduling with break management and leave handling." },
                { icon: Users, title: "Multi-Clinic", desc: "Manage multiple branches, departments, and staff from one platform." },
                { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security with role-based access control." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-white p-6 shadow-sm">
                  <item.icon className="h-10 w-10 text-blue-600" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <p className="text-center text-sm text-gray-500">
          DoctorDjango - Doctor Appointment Booking Platform
        </p>
      </footer>
    </div>
  );
}
