from rest_framework.permissions import BasePermission

from apps.organizations.models import OrganizationMembership


class HasOrganizationContext(BasePermission):
    """Requires X-Organization-Id header and active membership."""

    def has_permission(self, request, view):
        return request.organization is not None


class IsOrganizationAdmin(BasePermission):
    def has_permission(self, request, view):
        if not hasattr(request, "membership"):
            return False
        return request.membership.role in (
            OrganizationMembership.Role.ORGANIZATION_ADMIN,
            OrganizationMembership.Role.SUPER_ADMIN,
        )


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff


class IsDoctorRole(BasePermission):
    def has_permission(self, request, view):
        if not hasattr(request, "membership"):
            return False
        return request.membership.role == OrganizationMembership.Role.DOCTOR


class IsStaffRole(BasePermission):
    def has_permission(self, request, view):
        if not hasattr(request, "membership"):
            return False
        return request.membership.role in (
            OrganizationMembership.Role.RECEPTIONIST,
            OrganizationMembership.Role.STAFF,
            OrganizationMembership.Role.ORGANIZATION_ADMIN,
            OrganizationMembership.Role.SUPER_ADMIN,
        )


class IsPatientRole(BasePermission):
    def has_permission(self, request, view):
        if not hasattr(request, "membership"):
            return False
        return request.membership.role == OrganizationMembership.Role.PATIENT
