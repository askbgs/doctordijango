from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import DoctorProfile

User = get_user_model()


class DoctorProfileSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)

    class Meta:
        model = DoctorProfile
        fields = [
            "id", "user", "doctor_name", "email", "organization",
            "department", "department_name", "medical_registration_number",
            "specialization", "qualification", "biography",
            "consultation_fee", "experience_years", "languages",
            "profile_image", "active", "verified", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class DoctorPublicSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="user.full_name", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True, default=None)

    class Meta:
        model = DoctorProfile
        fields = [
            "id", "doctor_name", "organization_name", "department_name",
            "specialization", "qualification", "biography",
            "consultation_fee", "experience_years", "languages",
            "profile_image",
        ]
