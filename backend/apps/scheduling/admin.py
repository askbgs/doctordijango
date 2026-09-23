from django.contrib import admin

from .models import DoctorLeave, DoctorSchedule


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ["doctor", "branch", "weekday", "start_time", "end_time", "active"]
    list_filter = ["weekday", "active"]


@admin.register(DoctorLeave)
class DoctorLeaveAdmin(admin.ModelAdmin):
    list_display = ["doctor", "start_datetime", "end_datetime", "status"]
    list_filter = ["status"]
