from rest_framework import generics, permissions, status
from rest_framework.response import Response

from common.permissions.roles import HasOrganizationContext, IsOrganizationAdmin, IsSuperAdmin

from .models import Branch, Department, Organization, OrganizationMembership
from .serializers import (
    BranchSerializer,
    DepartmentSerializer,
    MembershipSerializer,
    OrganizationSerializer,
)


class OrganizationListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Organization.objects.all()
        org_ids = OrganizationMembership.objects.filter(
            user=self.request.user, active=True
        ).values_list("organization_id", flat=True)
        return Organization.objects.filter(id__in=org_ids)


class OrganizationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsOrganizationAdmin]

    def get_queryset(self):
        return Organization.objects.filter(id=self.request.organization.id)


class BranchListCreateView(generics.ListCreateAPIView):
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def get_queryset(self):
        return Branch.objects.filter(organization=self.request.organization)

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), HasOrganizationContext(), IsOrganizationAdmin()]
        return [permissions.IsAuthenticated(), HasOrganizationContext()]

    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)


class BranchDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsOrganizationAdmin]

    def get_queryset(self):
        return Branch.objects.filter(organization=self.request.organization)


class DepartmentListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def get_queryset(self):
        return Department.objects.filter(organization=self.request.organization)

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), HasOrganizationContext(), IsOrganizationAdmin()]
        return [permissions.IsAuthenticated(), HasOrganizationContext()]

    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsOrganizationAdmin]

    def get_queryset(self):
        return Department.objects.filter(organization=self.request.organization)


class MembershipListCreateView(generics.ListCreateAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsOrganizationAdmin]

    def get_queryset(self):
        return OrganizationMembership.objects.filter(
            organization=self.request.organization
        ).select_related("user", "organization")

    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)


class MembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsOrganizationAdmin]

    def get_queryset(self):
        return OrganizationMembership.objects.filter(
            organization=self.request.organization
        ).select_related("user", "organization")
