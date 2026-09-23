from django.contrib import admin

from .models import Branch, Department, Organization, OrganizationMembership


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "status", "city", "country"]
    search_fields = ["name", "slug"]
    list_filter = ["status"]


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ["name", "organization", "city", "active"]
    list_filter = ["active", "organization"]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "organization", "active"]
    list_filter = ["active", "organization"]


@admin.register(OrganizationMembership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "role", "active"]
    list_filter = ["role", "active", "organization"]
