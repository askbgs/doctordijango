import logging
from datetime import datetime, timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.scheduling.models import DoctorLeave, DoctorSchedule
from common.exceptions.base import InvalidStatusTransitionError, SlotUnavailableError

from .models import Appointment

logger = logging.getLogger(__name__)


def generate_reference():
    today = timezone.now().strftime("%Y%m%d")
    last = (
        Appointment.objects.filter(reference__startswith=f"APT-{today}-")
        .order_by("-reference")
        .values_list("reference", flat=True)
        .first()
    )
    if last:
        seq = int(last.split("-")[-1]) + 1
    else:
        seq = 1
    return f"APT-{today}-{seq:06d}"


def get_available_slots(doctor_id, branch_id, date):
    weekday = date.weekday()
    schedules = DoctorSchedule.objects.filter(
        doctor_id=doctor_id, branch_id=branch_id, weekday=weekday, active=True
    )

    if not schedules.exists():
        return []

    leaves = DoctorLeave.objects.filter(
        doctor_id=doctor_id,
        status=DoctorLeave.Status.APPROVED,
        start_datetime__date__lte=date,
        end_datetime__date__gte=date,
    )
    if leaves.exists():
        return []

    booked = set(
        Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date=date,
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.CONFIRMED,
                Appointment.Status.CHECKED_IN,
                Appointment.Status.IN_PROGRESS,
            ],
        ).values_list("start_time", flat=True)
    )

    slots = []
    for schedule in schedules:
        current = datetime.combine(date, schedule.start_time)
        end = datetime.combine(date, schedule.end_time)
        duration = timedelta(minutes=schedule.slot_duration)

        while current + duration <= end:
            slot_time = current.time()

            if schedule.break_start and schedule.break_end:
                if schedule.break_start <= slot_time < schedule.break_end:
                    current += duration
                    continue

            if slot_time not in booked:
                slot_end = (current + duration).time()
                slots.append({
                    "start_time": slot_time.strftime("%H:%M"),
                    "end_time": slot_end.strftime("%H:%M"),
                    "duration": schedule.slot_duration,
                })

            current += duration

    return slots


@transaction.atomic
def book_appointment(*, doctor, branch, patient, appointment_date, start_time, end_time,
                     appointment_type, reason="", booking_source, created_by, organization):
    if appointment_date < timezone.now().date():
        raise SlotUnavailableError("Cannot book appointments in the past.")

    conflict = (
        Appointment.objects.select_for_update()
        .filter(
            doctor=doctor,
            appointment_date=appointment_date,
            start_time=start_time,
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.CONFIRMED,
                Appointment.Status.CHECKED_IN,
                Appointment.Status.IN_PROGRESS,
            ],
        )
        .exists()
    )

    if conflict:
        raise SlotUnavailableError()

    patient_conflict = (
        Appointment.objects.select_for_update()
        .filter(
            patient=patient,
            doctor=doctor,
            appointment_date=appointment_date,
            start_time=start_time,
            status__in=[
                Appointment.Status.PENDING,
                Appointment.Status.CONFIRMED,
                Appointment.Status.CHECKED_IN,
                Appointment.Status.IN_PROGRESS,
            ],
        )
        .exists()
    )

    if patient_conflict:
        raise SlotUnavailableError("You already have an appointment at this time.")

    reference = generate_reference()

    appointment = Appointment.objects.create(
        organization=organization,
        branch=branch,
        doctor=doctor,
        patient=patient,
        appointment_date=appointment_date,
        start_time=start_time,
        end_time=end_time,
        appointment_type=appointment_type,
        reason=reason,
        booking_source=booking_source,
        created_by=created_by,
        reference=reference,
    )

    logger.info("Appointment booked: %s for patient %s with doctor %s", reference, patient.id, doctor.id)
    return appointment


def transition_status(appointment, new_status, cancellation_reason=""):
    if not appointment.can_transition_to(new_status):
        raise InvalidStatusTransitionError(
            f"Cannot transition from {appointment.status} to {new_status}."
        )
    appointment.status = new_status
    if new_status == Appointment.Status.CANCELLED and cancellation_reason:
        appointment.cancellation_reason = cancellation_reason
    appointment.save(update_fields=["status", "cancellation_reason", "updated_at"])
    return appointment
