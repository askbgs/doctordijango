"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Shield,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Heart,
  Stethoscope,
  Activity,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const slides = [
  {
    title: "Book Your Doctor\nAppointment Online",
    subtitle: "Skip the waiting room. Find top doctors, check real-time availability, and book instantly from anywhere.",
    cta: "Book an Appointment",
    ctaLink: "/register",
    gradient: "from-blue-600 via-blue-700 to-indigo-800",
    accent: "bg-blue-400/20",
    icon: Stethoscope,
    stats: [
      { value: "500+", label: "Doctors" },
      { value: "50K+", label: "Patients" },
      { value: "99.9%", label: "Uptime" },
    ],
  },
  {
    title: "Smart Scheduling\nfor Modern Clinics",
    subtitle: "Automated slot management, break handling, and leave tracking. Your clinic runs itself.",
    cta: "Start Free Trial",
    ctaLink: "/register",
    gradient: "from-emerald-600 via-teal-700 to-cyan-800",
    accent: "bg-emerald-400/20",
    icon: Calendar,
    stats: [
      { value: "24/7", label: "Booking" },
      { value: "30s", label: "Avg. Book Time" },
      { value: "0", label: "Double Bookings" },
    ],
  },
  {
    title: "Multi-Branch\nClinic Management",
    subtitle: "One platform to manage all your branches, departments, doctors, and staff with role-based access.",
    cta: "Explore Features",
    ctaLink: "/register",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    accent: "bg-violet-400/20",
    icon: Activity,
    stats: [
      { value: "Multi", label: "Branches" },
      { value: "5", label: "User Roles" },
      { value: "100%", label: "Secure" },
    ],
  },
];

function FloatingShapes({ accent }: { accent: string }) {
  return (
    <>
      <div className={`absolute -top-20 -right-20 h-72 w-72 rounded-full ${accent} blur-3xl animate-pulse`} />
      <div className={`absolute top-1/2 -left-32 h-96 w-96 rounded-full ${accent} blur-3xl animate-pulse`} style={{ animationDelay: "1s" }} />
      <div className={`absolute -bottom-20 right-1/4 h-64 w-64 rounded-full ${accent} blur-3xl animate-pulse`} style={{ animationDelay: "2s" }} />
    </>
  );
}

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [isTransitioning]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className={`relative min-h-[90vh] overflow-hidden bg-gradient-to-br ${slide.gradient} transition-all duration-700`}>
      <FloatingShapes accent={slide.accent} />

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-8">
          <div className={`flex flex-col justify-center transition-all duration-700 ${isTransitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"}`}>
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Trusted by 500+ healthcare providers
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {slide.title.split("\n").map((line, i) => (
                <span key={i} className={i > 0 ? "block mt-2" : ""}>
                  {line}
                </span>
              ))}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              {slide.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={slide.ctaLink}
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {slide.cta}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8">
              {slide.stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`hidden items-center justify-center lg:flex transition-all duration-700 ${isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}>
            <div className="relative">
              <div className="relative h-[480px] w-[420px] rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <slide.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">DoctorDjango</div>
                    <div className="text-sm text-white/60">Healthcare Platform</div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    { time: "09:00 AM", doctor: "Dr. Sarah Wilson", dept: "Cardiology", status: "Confirmed" },
                    { time: "10:30 AM", doctor: "Dr. James Chen", dept: "Neurology", status: "Pending" },
                    { time: "02:00 PM", doctor: "Dr. Amira Patel", dept: "Dermatology", status: "Confirmed" },
                    { time: "03:30 PM", doctor: "Dr. Michael Ross", dept: "Orthopedics", status: "Open" },
                  ].map((apt) => (
                    <div
                      key={apt.time}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                    >
                      <div className="text-center">
                        <div className="text-xs text-white/50">Time</div>
                        <div className="text-sm font-semibold text-white">{apt.time}</div>
                      </div>
                      <div className="h-10 w-px bg-white/10" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{apt.doctor}</div>
                        <div className="text-xs text-white/50">{apt.dept}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        apt.status === "Confirmed"
                          ? "bg-green-400/20 text-green-300"
                          : apt.status === "Pending"
                            ? "bg-yellow-400/20 text-yellow-300"
                            : "bg-blue-400/20 text-blue-300"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400/20">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Appointment Booked!</div>
                    <div className="text-xs text-white/60">Confirmation sent via email</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["bg-blue-400", "bg-emerald-400", "bg-violet-400"].map((bg, i) => (
                      <div key={i} className={`h-8 w-8 rounded-full ${bg} border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white`}>
                        {["S", "J", "A"][i]}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-white/80">+47 online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4">
        <button onClick={prev} className="rounded-full border border-white/20 p-2 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
        <button onClick={next} className="rounded-full border border-white/20 p-2 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Calendar,
    title: "Easy Online Booking",
    desc: "Patients book appointments in seconds with real-time slot availability and instant confirmation.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    desc: "Automated slot generation with break management, leave tracking, and conflict prevention.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Users,
    title: "Multi-Branch Support",
    desc: "Manage multiple clinic branches, departments, and staff from a single unified dashboard.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    desc: "Enterprise-grade security with role-based access control and complete audit logging.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Activity,
    title: "Real-Time Analytics",
    desc: "Track appointments, patient flow, revenue, and doctor performance with live dashboards.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Heart,
    title: "Patient-Centric",
    desc: "Patient profiles, appointment history, and automated reminders for a seamless experience.",
    color: "bg-cyan-50 text-cyan-600",
  },
];

const steps = [
  { step: "01", title: "Find a Doctor", desc: "Browse our directory of verified doctors by specialization, location, or availability." },
  { step: "02", title: "Pick a Time Slot", desc: "View real-time availability and select the date and time that works best for you." },
  { step: "03", title: "Confirm Booking", desc: "Get instant confirmation with appointment details sent via email notification." },
  { step: "04", title: "Visit the Doctor", desc: "Show up at the scheduled time. No queues, no waiting — your slot is guaranteed." },
];

const testimonials = [
  {
    name: "Dr. Sarah Wilson",
    role: "Cardiologist, CityCare Medical",
    text: "DoctorDjango transformed how we manage appointments. No more double bookings, no more scheduling conflicts. Our patient satisfaction went up 40%.",
    rating: 5,
    initials: "SW",
    bg: "bg-blue-500",
  },
  {
    name: "Amal Fernando",
    role: "Patient",
    text: "I used to spend 2 hours waiting at the clinic. Now I book online, arrive at my time, and see the doctor immediately. Absolutely game-changing.",
    rating: 5,
    initials: "AF",
    bg: "bg-emerald-500",
  },
  {
    name: "Nadia Perera",
    role: "Clinic Manager, Colombo Family Clinic",
    text: "Managing 3 branches was a nightmare before. Now everything is in one place — schedules, staff, patients. We saved 15 hours per week on admin work.",
    rating: 5,
    initials: "NP",
    bg: "bg-violet-500",
  },
];

export default function HomePage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-white">
      <header className="absolute top-0 z-50 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DoctorDjango</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-white/70 transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-white/70 transition-colors hover:text-white">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-white/70 transition-colors hover:text-white">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:text-white">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg shadow-black/5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <HeroCarousel />

      <section className="relative bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40">
            {["CityCare Medical", "Colombo Family Clinic", "MediPro Health", "HealthFirst", "WellCare Centers"].map((name) => (
              <span key={name} className="text-lg font-semibold text-gray-400">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" data-animate className="relative overflow-hidden bg-gray-50 py-24">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-700 ${isVisible("features") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              Features
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need to Run<br />a Modern Healthcare Practice
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Powerful tools designed to simplify every aspect of clinic management and patient care.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-700 hover:-translate-y-1 hover:shadow-lg ${
                  isVisible("features") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} transition-transform group-hover:scale-110`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" data-animate className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-700 ${isVisible("how-it-works") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <span className="inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              How It Works
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Book an Appointment in 4 Simple Steps
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.step}
                className={`relative text-center transition-all duration-700 ${
                  isVisible("how-it-works") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-gray-200 to-transparent lg:block" />
                )}
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50" />
                  <span className="relative text-3xl font-extrabold text-blue-600">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-animate id="stats" className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ${isVisible("stats") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "500+", label: "Verified Doctors", icon: Stethoscope },
              { value: "50,000+", label: "Happy Patients", icon: Heart },
              { value: "100,000+", label: "Appointments Booked", icon: Calendar },
              { value: "99.9%", label: "Platform Uptime", icon: Activity },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center transition-all duration-500"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-white/40" />
                <div className="text-4xl font-extrabold text-white sm:text-5xl">{stat.value}</div>
                <div className="mt-2 text-base text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" data-animate className="relative bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-700 ${isVisible("testimonials") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
              Testimonials
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by Doctors and Patients
            </h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-700 hover:-translate-y-1 hover:shadow-lg ${
                  isVisible("testimonials") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-4 text-base leading-relaxed text-gray-600">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-gray-50 pt-6">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full ${t.bg} text-sm font-bold text-white`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-animate id="cta" className="relative bg-white py-24">
        <div className={`mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 transition-all duration-700 ${isVisible("cta") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to Transform Your Practice?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Join hundreds of healthcare providers already using DoctorDjango. Start your free trial today — no credit card required.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DoctorDjango</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                Modern doctor appointment booking platform built for clinics and patients who value their time.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Product</h4>
              <ul className="mt-4 space-y-3">
                {["Features", "Pricing", "Integrations", "API Docs"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 transition-colors hover:text-white cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Company</h4>
              <ul className="mt-4 space-y-3">
                {["About Us", "Careers", "Blog", "Contact"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-gray-500 transition-colors hover:text-white cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Contact</h4>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" /> hello@doctordjango.com
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4" /> +94 11 234 5678
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /> Colombo, Sri Lanka
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} DoctorDjango. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
