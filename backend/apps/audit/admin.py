from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "entity", "actor", "organization", "created_at"]
    list_filter = ["action", "entity"]
    search_fields = ["entity_id", "action"]
    readonly_fields = [
        "actor", "organization", "action", "entity", "entity_id",
        "ip_address", "user_agent", "metadata", "created_at",
    ]
