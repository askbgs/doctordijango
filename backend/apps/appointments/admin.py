from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ["reference", "doctor", "patient", "appointment_date", "start_time", "status"]
    list_filter = ["status", "appointment_type", "appointment_date"]
    search_fields = ["reference", "patient__first_name", "patient__last_name"]
    readonly_fields = ["reference"]
