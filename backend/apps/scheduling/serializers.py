from rest_framework import serializers

from .models import DoctorLeave, DoctorSchedule


class DoctorScheduleSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source="get_weekday_display", read_only=True)
    doctor_name = serializers.CharField(source="doctor.user.full_name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)

    class Meta:
        model = DoctorSchedule
        fields = [
            "id", "doctor", "doctor_name", "branch", "branch_name",
            "weekday", "weekday_display", "start_time", "end_time",
            "slot_duration", "break_start", "break_end", "active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("start_time") and attrs.get("end_time"):
            if attrs["start_time"] >= attrs["end_time"]:
                raise serializers.ValidationError("Start time must be before end time.")
        bs = attrs.get("break_start")
        be = attrs.get("break_end")
        if (bs and not be) or (be and not bs):
            raise serializers.ValidationError("Both break start and end must be provided.")
        if bs and be and bs >= be:
            raise serializers.ValidationError("Break start must be before break end.")
        return attrs


class DoctorLeaveSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.user.full_name", read_only=True)

    class Meta:
        model = DoctorLeave
        fields = [
            "id", "doctor", "doctor_name", "start_datetime",
            "end_datetime", "reason", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, attrs):
        if attrs.get("start_datetime") and attrs.get("end_datetime"):
            if attrs["start_datetime"] >= attrs["end_datetime"]:
                raise serializers.ValidationError("Start must be before end.")
        return attrs
