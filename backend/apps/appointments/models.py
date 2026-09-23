from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class Appointment(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CHECKED_IN = "CHECKED_IN", "Checked In"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        NO_SHOW = "NO_SHOW", "No Show"
        RESCHEDULED = "RESCHEDULED", "Rescheduled"

    class AppointmentType(models.TextChoices):
        IN_PERSON = "IN_PERSON", "In Person"
        VIDEO = "VIDEO", "Video"
        PHONE = "PHONE", "Phone"

    class BookingSource(models.TextChoices):
        PATIENT_PORTAL = "PATIENT_PORTAL", "Patient Portal"
        STAFF = "STAFF", "Staff"
        DOCTOR = "DOCTOR", "Doctor"
        ADMIN = "ADMIN", "Admin"

    VALID_TRANSITIONS = {
        "PENDING": ["CONFIRMED", "CANCELLED"],
        "CONFIRMED": ["CHECKED_IN", "CANCELLED", "NO_SHOW", "RESCHEDULED"],
        "CHECKED_IN": ["IN_PROGRESS", "CANCELLED"],
        "IN_PROGRESS": ["COMPLETED"],
        "COMPLETED": [],
        "CANCELLED": [],
        "NO_SHOW": [],
        "RESCHEDULED": [],
    }

    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="appointments")
    branch = models.ForeignKey("organizations.Branch", on_delete=models.CASCADE, related_name="appointments")
    doctor = models.ForeignKey("doctors.DoctorProfile", on_delete=models.CASCADE, related_name="appointments")
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    appointment_type = models.CharField(
        max_length=20, choices=AppointmentType.choices, default=AppointmentType.IN_PERSON
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    booking_source = models.CharField(
        max_length=20, choices=BookingSource.choices, default=BookingSource.PATIENT_PORTAL
    )
    reference = models.CharField(max_length=30, unique=True, editable=False)
    reason = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    cancellation_reason = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_appointments"
    )

    class Meta:
        ordering = ["appointment_date", "start_time"]
        indexes = [
            models.Index(fields=["doctor", "appointment_date", "start_time"]),
            models.Index(fields=["organization", "appointment_date"]),
            models.Index(fields=["patient", "appointment_date"]),
            models.Index(fields=["status"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["doctor", "appointment_date", "start_time"],
                condition=models.Q(status__in=["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"]),
                name="unique_active_doctor_slot",
            ),
        ]

    def __str__(self):
        return f"{self.reference} - {self.doctor} - {self.patient}"

    def can_transition_to(self, new_status):
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])
