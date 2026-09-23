from django.contrib import admin

from .models import DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "specialization", "active", "verified"]
    list_filter = ["active", "verified", "specialization", "organization"]
    search_fields = ["user__first_name", "user__last_name", "specialization"]
