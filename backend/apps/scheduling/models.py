from django.db import models

from common.models import TimeStampedModel


class DoctorSchedule(TimeStampedModel):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    doctor = models.ForeignKey("doctors.DoctorProfile", on_delete=models.CASCADE, related_name="schedules")
    branch = models.ForeignKey("organizations.Branch", on_delete=models.CASCADE, related_name="doctor_schedules")
    weekday = models.IntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration = models.PositiveIntegerField(default=30, help_text="Duration in minutes")
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = [("doctor", "branch", "weekday")]
        ordering = ["weekday", "start_time"]

    def __str__(self):
        return f"{self.doctor} - {self.get_weekday_display()} ({self.start_time}-{self.end_time})"


class DoctorLeave(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    doctor = models.ForeignKey("doctors.DoctorProfile", on_delete=models.CASCADE, related_name="leaves")
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    reason = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    class Meta:
        ordering = ["-start_datetime"]

    def __str__(self):
        return f"{self.doctor} leave: {self.start_datetime} to {self.end_datetime}"
