from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class DoctorProfile(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="doctor_profile")
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="doctors")
    department = models.ForeignKey(
        "organizations.Department", on_delete=models.SET_NULL, null=True, blank=True, related_name="doctors"
    )
    medical_registration_number = models.CharField(max_length=100, blank=True, default="")
    specialization = models.CharField(max_length=255)
    qualification = models.CharField(max_length=500, blank=True, default="")
    biography = models.TextField(blank=True, default="")
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    experience_years = models.PositiveIntegerField(default=0)
    languages = models.JSONField(default=list, blank=True)
    profile_image = models.ImageField(upload_to="doctors/", blank=True, null=True)
    active = models.BooleanField(default=True)
    verified = models.BooleanField(default=False)

    class Meta:
        ordering = ["user__first_name"]
        indexes = [
            models.Index(fields=["organization", "specialization"]),
            models.Index(fields=["organization", "active"]),
        ]

    def __str__(self):
        return f"Dr. {self.user.full_name} - {self.specialization}"
