from rest_framework import generics, permissions

from common.permissions.roles import HasOrganizationContext, IsOrganizationAdmin

from .models import DoctorLeave, DoctorSchedule
from .serializers import DoctorLeaveSerializer, DoctorScheduleSerializer


class ScheduleListCreateView(generics.ListCreateAPIView):
    serializer_class = DoctorScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]
    filterset_fields = ["doctor", "branch", "weekday", "active"]

    def get_queryset(self):
        return DoctorSchedule.objects.filter(
            doctor__organization=self.request.organization
        ).select_related("doctor__user", "branch")

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), HasOrganizationContext(), IsOrganizationAdmin()]
        return [permissions.IsAuthenticated(), HasOrganizationContext()]


class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DoctorScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsOrganizationAdmin]

    def get_queryset(self):
        return DoctorSchedule.objects.filter(
            doctor__organization=self.request.organization
        ).select_related("doctor__user", "branch")


class LeaveListCreateView(generics.ListCreateAPIView):
    serializer_class = DoctorLeaveSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]
    filterset_fields = ["doctor", "status"]

    def get_queryset(self):
        return DoctorLeave.objects.filter(
            doctor__organization=self.request.organization
        ).select_related("doctor__user")


class LeaveDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DoctorLeaveSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def get_queryset(self):
        return DoctorLeave.objects.filter(
            doctor__organization=self.request.organization
        ).select_related("doctor__user")
