from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter

from common.permissions.roles import HasOrganizationContext, IsStaffRole

from .models import PatientProfile
from .serializers import PatientProfileSerializer


class PatientListView(generics.ListAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsStaffRole]
    search_fields = ["user__first_name", "user__last_name", "user__email", "user__phone"]

    def get_queryset(self):
        from apps.organizations.models import OrganizationMembership

        patient_user_ids = OrganizationMembership.objects.filter(
            organization=self.request.organization,
            role=OrganizationMembership.Role.PATIENT,
            active=True,
        ).values_list("user_id", flat=True)
        return PatientProfile.objects.filter(user_id__in=patient_user_ids).select_related("user")


class PatientDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PatientProfile.objects.filter(user=self.request.user).select_related("user")


class PatientMyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = PatientProfile.objects.get_or_create(user=self.request.user)
        return profile
