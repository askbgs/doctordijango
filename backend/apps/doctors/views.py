from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter

from common.permissions.roles import HasOrganizationContext, IsOrganizationAdmin

from .models import DoctorProfile
from .serializers import DoctorProfileSerializer, DoctorPublicSerializer


class DoctorListCreateView(generics.ListCreateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["specialization", "department", "active"]
    search_fields = ["user__first_name", "user__last_name", "specialization"]

    def get_queryset(self):
        return DoctorProfile.objects.filter(
            organization=self.request.organization
        ).select_related("user", "department")

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), HasOrganizationContext(), IsOrganizationAdmin()]
        return [permissions.IsAuthenticated(), HasOrganizationContext()]

    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def get_queryset(self):
        return DoctorProfile.objects.filter(
            organization=self.request.organization
        ).select_related("user", "department")


class DoctorPublicListView(generics.ListAPIView):
    serializer_class = DoctorPublicSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["specialization", "organization"]
    search_fields = ["user__first_name", "user__last_name", "specialization"]

    def get_queryset(self):
        return DoctorProfile.objects.filter(
            active=True, verified=True
        ).select_related("user", "organization", "department")


class DoctorPublicDetailView(generics.RetrieveAPIView):
    serializer_class = DoctorPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return DoctorProfile.objects.filter(
            active=True, verified=True
        ).select_related("user", "organization", "department")
