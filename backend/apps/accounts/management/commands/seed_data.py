from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.appointments.services import generate_reference
from apps.doctors.models import DoctorProfile
from apps.organizations.models import Branch, Department, Organization, OrganizationMembership
from apps.patients.models import PatientProfile
from apps.scheduling.models import DoctorSchedule
from apps.subscriptions.models import OrganizationSubscription, SubscriptionPlan

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with demo data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # Plans
        free_plan, _ = SubscriptionPlan.objects.get_or_create(
            tier=SubscriptionPlan.Tier.FREE,
            defaults={"name": "Free", "price_monthly": 0, "max_doctors": 2, "max_staff": 3, "max_branches": 1, "max_monthly_appointments": 50},
        )
        starter_plan, _ = SubscriptionPlan.objects.get_or_create(
            tier=SubscriptionPlan.Tier.STARTER,
            defaults={"name": "Starter", "price_monthly": 29, "max_doctors": 5, "max_staff": 10, "max_branches": 2, "max_monthly_appointments": 500},
        )
        pro_plan, _ = SubscriptionPlan.objects.get_or_create(
            tier=SubscriptionPlan.Tier.PROFESSIONAL,
            defaults={"name": "Professional", "price_monthly": 99, "max_doctors": 20, "max_staff": 50, "max_branches": 5, "max_monthly_appointments": 5000},
        )
        SubscriptionPlan.objects.get_or_create(
            tier=SubscriptionPlan.Tier.ENTERPRISE,
            defaults={"name": "Enterprise", "price_monthly": 299, "max_doctors": 100, "max_staff": 200, "max_branches": 20, "max_monthly_appointments": 50000},
        )

        # Super admin
        superadmin, _ = User.objects.get_or_create(
            email="superadmin@doctordjango.com",
            defaults={"first_name": "Platform", "last_name": "Admin", "is_staff": True, "is_superuser": True, "is_verified": True},
        )
        if not superadmin.has_usable_password():
            superadmin.set_password("SuperAdmin123!")
            superadmin.save()

        # Org 1
        org1, _ = Organization.objects.get_or_create(
            slug="citycare-medical",
            defaults={
                "name": "CityCare Medical Center", "email": "info@citycare.example.com",
                "phone": "+94112345678", "address": "123 Medical Drive", "city": "Colombo",
                "country": "Sri Lanka", "timezone": "Asia/Colombo", "currency": "LKR",
            },
        )

        # Org 2
        org2, _ = Organization.objects.get_or_create(
            slug="colombo-family-clinic",
            defaults={
                "name": "Colombo Family Clinic", "email": "info@colombofamily.example.com",
                "phone": "+94119876543", "address": "456 Health Avenue", "city": "Colombo",
                "country": "Sri Lanka", "timezone": "Asia/Colombo", "currency": "LKR",
            },
        )

        # Subscriptions
        OrganizationSubscription.objects.get_or_create(organization=org1, defaults={"plan": pro_plan, "status": OrganizationSubscription.Status.ACTIVE})
        OrganizationSubscription.objects.get_or_create(organization=org2, defaults={"plan": starter_plan, "status": OrganizationSubscription.Status.ACTIVE})

        # Branches
        branch1, _ = Branch.objects.get_or_create(
            organization=org1, code="CC-MAIN",
            defaults={"name": "Main Branch", "city": "Colombo", "timezone": "Asia/Colombo"},
        )
        branch2, _ = Branch.objects.get_or_create(
            organization=org1, code="CC-KANDY",
            defaults={"name": "Kandy Branch", "city": "Kandy", "timezone": "Asia/Colombo"},
        )
        branch3, _ = Branch.objects.get_or_create(
            organization=org2, code="CF-MAIN",
            defaults={"name": "Main Branch", "city": "Colombo", "timezone": "Asia/Colombo"},
        )

        # Departments
        dept_cardio, _ = Department.objects.get_or_create(organization=org1, name="Cardiology")
        dept_gp, _ = Department.objects.get_or_create(organization=org1, name="General Medicine")
        dept_pedi, _ = Department.objects.get_or_create(organization=org1, name="Pediatrics")
        dept_derm, _ = Department.objects.get_or_create(organization=org1, name="Dermatology")
        dept_ortho, _ = Department.objects.get_or_create(organization=org1, name="Orthopedics")
        dept2_gp, _ = Department.objects.get_or_create(organization=org2, name="General Medicine")

        # Admin user
        clinic_admin, _ = User.objects.get_or_create(
            email="admin@citycare.example.com",
            defaults={"first_name": "Clinic", "last_name": "Admin", "is_verified": True},
        )
        if not clinic_admin.has_usable_password():
            clinic_admin.set_password("ClinicAdmin123!")
            clinic_admin.save()
        OrganizationMembership.objects.get_or_create(
            user=clinic_admin, organization=org1, role=OrganizationMembership.Role.ORGANIZATION_ADMIN,
        )

        # Doctors
        doctors_data = [
            ("dr.silva@example.com", "Amal", "Silva", "Cardiology", dept_cardio, org1, branch1, 3500, 15),
            ("dr.perera@example.com", "Nimal", "Perera", "General Medicine", dept_gp, org1, branch1, 2000, 10),
            ("dr.fernando@example.com", "Kumari", "Fernando", "Pediatrics", dept_pedi, org1, branch1, 2500, 8),
            ("dr.jayasinghe@example.com", "Ruwan", "Jayasinghe", "Dermatology", dept_derm, org1, branch2, 3000, 12),
            ("dr.bandara@example.com", "Chaminda", "Bandara", "Orthopedics", dept_ortho, org1, branch2, 4000, 20),
            ("dr.wickrama@example.com", "Saman", "Wickramasinghe", "General Medicine", dept2_gp, org2, branch3, 1500, 5),
        ]

        doctor_profiles = []
        for email, first, last, spec, dept, org, branch, fee, exp in doctors_data:
            user, _ = User.objects.get_or_create(
                email=email, defaults={"first_name": first, "last_name": last, "is_verified": True},
            )
            if not user.has_usable_password():
                user.set_password("Doctor123!")
                user.save()
            OrganizationMembership.objects.get_or_create(
                user=user, organization=org, role=OrganizationMembership.Role.DOCTOR,
                defaults={"branch": branch},
            )
            profile, _ = DoctorProfile.objects.get_or_create(
                user=user, defaults={
                    "organization": org, "department": dept, "specialization": spec,
                    "qualification": "MBBS, MD", "consultation_fee": fee,
                    "experience_years": exp, "languages": ["English", "Sinhala"],
                    "active": True, "verified": True,
                    "biography": f"Dr. {first} {last} is a specialist in {spec} with {exp} years of experience.",
                },
            )
            doctor_profiles.append((profile, branch))

        # Receptionist
        receptionist, _ = User.objects.get_or_create(
            email="receptionist@citycare.example.com",
            defaults={"first_name": "Malini", "last_name": "Rathnayake", "is_verified": True},
        )
        if not receptionist.has_usable_password():
            receptionist.set_password("Staff123!")
            receptionist.save()
        OrganizationMembership.objects.get_or_create(
            user=receptionist, organization=org1, role=OrganizationMembership.Role.RECEPTIONIST,
            defaults={"branch": branch1},
        )

        # Patient
        patient_user, _ = User.objects.get_or_create(
            email="patient@example.com",
            defaults={"first_name": "Kamal", "last_name": "Rajapaksha", "phone": "+94771234567", "is_verified": True},
        )
        if not patient_user.has_usable_password():
            patient_user.set_password("Patient123!")
            patient_user.save()
        OrganizationMembership.objects.get_or_create(
            user=patient_user, organization=org1, role=OrganizationMembership.Role.PATIENT,
        )
        PatientProfile.objects.get_or_create(
            user=patient_user,
            defaults={"date_of_birth": date(1990, 5, 15), "gender": "MALE", "blood_group": "O+", "address": "789 Patient Lane, Colombo"},
        )

        # Schedules (Mon-Fri for first 3 doctors)
        for profile, branch in doctor_profiles[:3]:
            for weekday in range(5):
                DoctorSchedule.objects.get_or_create(
                    doctor=profile, branch=branch, weekday=weekday,
                    defaults={
                        "start_time": time(9, 0), "end_time": time(17, 0),
                        "slot_duration": 30,
                        "break_start": time(12, 0), "break_end": time(13, 0),
                    },
                )

        # Sample appointments
        today = timezone.now().date()
        for i, (profile, branch) in enumerate(doctor_profiles[:3]):
            for hour_offset in range(3):
                apt_time = time(9 + hour_offset, 0)
                apt_end = time(9 + hour_offset, 30)
                apt_date = today + timedelta(days=1)
                if not Appointment.objects.filter(doctor=profile, appointment_date=apt_date, start_time=apt_time).exists():
                    Appointment.objects.create(
                        organization=profile.organization,
                        branch=branch,
                        doctor=profile,
                        patient=patient_user,
                        appointment_date=apt_date,
                        start_time=apt_time,
                        end_time=apt_end,
                        status=Appointment.Status.CONFIRMED if hour_offset == 0 else Appointment.Status.PENDING,
                        reference=generate_reference(),
                        booking_source=Appointment.BookingSource.PATIENT_PORTAL,
                        created_by=patient_user,
                    )

        self.stdout.write(self.style.SUCCESS("Seed data created successfully!"))
        self.stdout.write("")
        self.stdout.write("Demo accounts:")
        self.stdout.write("  Super Admin:   superadmin@doctordjango.com / SuperAdmin123!")
        self.stdout.write("  Clinic Admin:  admin@citycare.example.com / ClinicAdmin123!")
        self.stdout.write("  Doctor:        dr.silva@example.com / Doctor123!")
        self.stdout.write("  Receptionist:  receptionist@citycare.example.com / Staff123!")
        self.stdout.write("  Patient:       patient@example.com / Patient123!")
