from rest_framework import serializers

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.user.full_name", read_only=True)
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "reference", "organization", "branch", "branch_name",
            "doctor", "doctor_name", "patient", "patient_name",
            "appointment_date", "start_time", "end_time",
            "appointment_type", "status", "status_display",
            "booking_source", "reason", "notes",
            "cancellation_reason", "created_by",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "reference", "organization", "status",
            "created_by", "created_at", "updated_at",
        ]


class BookAppointmentSerializer(serializers.Serializer):
    doctor_id = serializers.UUIDField()
    branch_id = serializers.UUIDField()
    appointment_date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    appointment_type = serializers.ChoiceField(
        choices=Appointment.AppointmentType.choices, default=Appointment.AppointmentType.IN_PERSON
    )
    reason = serializers.CharField(required=False, default="")


class CancelAppointmentSerializer(serializers.Serializer):
    cancellation_reason = serializers.CharField(required=False, default="")


class AvailableSlotsSerializer(serializers.Serializer):
    doctor_id = serializers.UUIDField()
    branch_id = serializers.UUIDField()
    date = serializers.DateField()
