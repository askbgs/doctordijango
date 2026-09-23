import threading
from datetime import date, time, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.appointments.services import book_appointment, get_available_slots, transition_status
from apps.doctors.models import DoctorProfile
from apps.organizations.models import Branch, Department, Organization
from apps.scheduling.models import DoctorLeave, DoctorSchedule
from common.exceptions.base import InvalidStatusTransitionError, SlotUnavailableError

User = get_user_model()


class SlotAvailabilityTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Clinic", slug="test-clinic")
        self.branch = Branch.objects.create(organization=self.org, name="Main", code="MAIN")
        self.dept = Department.objects.create(organization=self.org, name="General")
        self.doctor_user = User.objects.create_user(
            email="doc@test.com", password="Test123!", first_name="Doc", last_name="Test"
        )
        self.doctor = DoctorProfile.objects.create(
            user=self.doctor_user, organization=self.org, department=self.dept,
            specialization="General", consultation_fee=100,
        )
        self.patient = User.objects.create_user(
            email="patient@test.com", password="Test123!", first_name="Pat", last_name="Test"
        )

        # Monday schedule: 9-12, 30 min slots, no break
        self.schedule = DoctorSchedule.objects.create(
            doctor=self.doctor, branch=self.branch, weekday=0,
            start_time=time(9, 0), end_time=time(12, 0), slot_duration=30,
        )

    def _next_weekday(self, weekday):
        today = timezone.now().date()
        days_ahead = weekday - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        return today + timedelta(days=days_ahead)

    def test_available_slots_count(self):
        monday = self._next_weekday(0)
        slots = get_available_slots(self.doctor.id, self.branch.id, monday)
        # 9:00-12:00 with 30min slots = 6 slots
        self.assertEqual(len(slots), 6)

    def test_booked_slot_excluded(self):
        monday = self._next_weekday(0)
        Appointment.objects.create(
            organization=self.org, branch=self.branch, doctor=self.doctor,
            patient=self.patient, appointment_date=monday,
            start_time=time(9, 0), end_time=time(9, 30),
            reference="APT-TEST-000001", created_by=self.patient,
        )
        slots = get_available_slots(self.doctor.id, self.branch.id, monday)
        self.assertEqual(len(slots), 5)
        self.assertNotIn("09:00", [s["start_time"] for s in slots])

    def test_leave_blocks_all_slots(self):
        monday = self._next_weekday(0)
        DoctorLeave.objects.create(
            doctor=self.doctor,
            start_datetime=timezone.make_aware(timezone.datetime.combine(monday, time(0, 0))),
            end_datetime=timezone.make_aware(timezone.datetime.combine(monday, time(23, 59))),
            status=DoctorLeave.Status.APPROVED,
        )
        slots = get_available_slots(self.doctor.id, self.branch.id, monday)
        self.assertEqual(len(slots), 0)

    def test_no_schedule_returns_empty(self):
        tuesday = self._next_weekday(1)
        slots = get_available_slots(self.doctor.id, self.branch.id, tuesday)
        self.assertEqual(len(slots), 0)

    def test_break_time_excluded(self):
        self.schedule.break_start = time(10, 0)
        self.schedule.break_end = time(10, 30)
        self.schedule.save()
        monday = self._next_weekday(0)
        slots = get_available_slots(self.doctor.id, self.branch.id, monday)
        self.assertEqual(len(slots), 5)
        self.assertNotIn("10:00", [s["start_time"] for s in slots])


class BookingTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Clinic", slug="test-clinic-2")
        self.branch = Branch.objects.create(organization=self.org, name="Main", code="MAIN2")
        self.dept = Department.objects.create(organization=self.org, name="General")
        self.doctor_user = User.objects.create_user(
            email="doc2@test.com", password="Test123!", first_name="Doc", last_name="Two"
        )
        self.doctor = DoctorProfile.objects.create(
            user=self.doctor_user, organization=self.org, department=self.dept,
            specialization="General", consultation_fee=100,
        )
        self.patient = User.objects.create_user(
            email="patient2@test.com", password="Test123!", first_name="Pat", last_name="Two"
        )

    def _future_date(self):
        return timezone.now().date() + timedelta(days=1)

    def test_book_appointment_success(self):
        apt = book_appointment(
            doctor=self.doctor, branch=self.branch, patient=self.patient,
            appointment_date=self._future_date(), start_time=time(10, 0),
            end_time=time(10, 30), appointment_type="IN_PERSON",
            booking_source="PATIENT_PORTAL", created_by=self.patient,
            organization=self.org,
        )
        self.assertIsNotNone(apt.reference)
        self.assertTrue(apt.reference.startswith("APT-"))
        self.assertEqual(apt.status, Appointment.Status.PENDING)

    def test_double_booking_prevented(self):
        future = self._future_date()
        book_appointment(
            doctor=self.doctor, branch=self.branch, patient=self.patient,
            appointment_date=future, start_time=time(10, 0), end_time=time(10, 30),
            appointment_type="IN_PERSON", booking_source="PATIENT_PORTAL",
            created_by=self.patient, organization=self.org,
        )
        patient2 = User.objects.create_user(
            email="patient3@test.com", password="Test123!", first_name="Another", last_name="Patient"
        )
        with self.assertRaises(SlotUnavailableError):
            book_appointment(
                doctor=self.doctor, branch=self.branch, patient=patient2,
                appointment_date=future, start_time=time(10, 0), end_time=time(10, 30),
                appointment_type="IN_PERSON", booking_source="PATIENT_PORTAL",
                created_by=patient2, organization=self.org,
            )

    def test_past_date_rejected(self):
        past = timezone.now().date() - timedelta(days=1)
        with self.assertRaises(SlotUnavailableError):
            book_appointment(
                doctor=self.doctor, branch=self.branch, patient=self.patient,
                appointment_date=past, start_time=time(10, 0), end_time=time(10, 30),
                appointment_type="IN_PERSON", booking_source="PATIENT_PORTAL",
                created_by=self.patient, organization=self.org,
            )

    def test_cancelled_slot_released(self):
        future = self._future_date()
        apt = book_appointment(
            doctor=self.doctor, branch=self.branch, patient=self.patient,
            appointment_date=future, start_time=time(10, 0), end_time=time(10, 30),
            appointment_type="IN_PERSON", booking_source="PATIENT_PORTAL",
            created_by=self.patient, organization=self.org,
        )
        transition_status(apt, Appointment.Status.CONFIRMED)
        transition_status(apt, Appointment.Status.CANCELLED)

        patient2 = User.objects.create_user(
            email="patient4@test.com", password="Test123!", first_name="New", last_name="Patient"
        )
        new_apt = book_appointment(
            doctor=self.doctor, branch=self.branch, patient=patient2,
            appointment_date=future, start_time=time(10, 0), end_time=time(10, 30),
            appointment_type="IN_PERSON", booking_source="PATIENT_PORTAL",
            created_by=patient2, organization=self.org,
        )
        self.assertIsNotNone(new_apt)


class StatusTransitionTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Clinic", slug="test-clinic-3")
        self.branch = Branch.objects.create(organization=self.org, name="Main", code="MAIN3")
        self.dept = Department.objects.create(organization=self.org, name="General")
        self.doctor_user = User.objects.create_user(
            email="doc3@test.com", password="Test123!", first_name="Doc", last_name="Three"
        )
        self.doctor = DoctorProfile.objects.create(
            user=self.doctor_user, organization=self.org, department=self.dept,
            specialization="General", consultation_fee=100,
        )
        self.patient = User.objects.create_user(
            email="patient5@test.com", password="Test123!", first_name="Pat", last_name="Five"
        )

    def _create_appointment(self):
        return book_appointment(
            doctor=self.doctor, branch=self.branch, patient=self.patient,
            appointment_date=timezone.now().date() + timedelta(days=1),
            start_time=time(14, 0), end_time=time(14, 30),
            appointment_type="IN_PERSON", booking_source="PATIENT_PORTAL",
            created_by=self.patient, organization=self.org,
        )

    def test_valid_transition_pending_to_confirmed(self):
        apt = self._create_appointment()
        apt = transition_status(apt, "CONFIRMED")
        self.assertEqual(apt.status, "CONFIRMED")

    def test_invalid_transition_pending_to_completed(self):
        apt = self._create_appointment()
        with self.assertRaises(InvalidStatusTransitionError):
            transition_status(apt, "COMPLETED")

    def test_full_happy_path(self):
        apt = self._create_appointment()
        apt = transition_status(apt, "CONFIRMED")
        apt = transition_status(apt, "CHECKED_IN")
        apt = transition_status(apt, "IN_PROGRESS")
        apt = transition_status(apt, "COMPLETED")
        self.assertEqual(apt.status, "COMPLETED")

    def test_cancel_confirmed(self):
        apt = self._create_appointment()
        apt = transition_status(apt, "CONFIRMED")
        apt = transition_status(apt, "CANCELLED", cancellation_reason="Patient request")
        self.assertEqual(apt.status, "CANCELLED")
        self.assertEqual(apt.cancellation_reason, "Patient request")

    def test_cannot_transition_from_completed(self):
        apt = self._create_appointment()
        apt = transition_status(apt, "CONFIRMED")
        apt = transition_status(apt, "CHECKED_IN")
        apt = transition_status(apt, "IN_PROGRESS")
        apt = transition_status(apt, "COMPLETED")
        with self.assertRaises(InvalidStatusTransitionError):
            transition_status(apt, "CANCELLED")
