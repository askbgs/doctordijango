from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.doctors.models import DoctorProfile
from apps.organizations.models import Branch, OrganizationMembership
from common.permissions.roles import HasOrganizationContext, IsStaffRole

from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AvailableSlotsSerializer,
    BookAppointmentSerializer,
    CancelAppointmentSerializer,
)
from .services import book_appointment, get_available_slots, transition_status


class AppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]
    filterset_fields = ["doctor", "patient", "status", "appointment_date", "appointment_type"]

    def get_queryset(self):
        qs = Appointment.objects.filter(
            organization=self.request.organization
        ).select_related("doctor__user", "patient", "branch")

        membership = getattr(self.request, "membership", None)
        if not membership:
            return qs.none()

        if membership.role == OrganizationMembership.Role.DOCTOR:
            return qs.filter(doctor__user=self.request.user)
        if membership.role == OrganizationMembership.Role.PATIENT:
            return qs.filter(patient=self.request.user)
        return qs


class BookAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def post(self, request):
        serializer = BookAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doctor = DoctorProfile.objects.get(
            id=data["doctor_id"], organization=request.organization
        )
        branch = Branch.objects.get(
            id=data["branch_id"], organization=request.organization
        )

        membership = getattr(request, "membership", None)
        if membership and membership.role in (
            OrganizationMembership.Role.STAFF,
            OrganizationMembership.Role.RECEPTIONIST,
            OrganizationMembership.Role.ORGANIZATION_ADMIN,
        ):
            booking_source = Appointment.BookingSource.STAFF
        elif membership and membership.role == OrganizationMembership.Role.DOCTOR:
            booking_source = Appointment.BookingSource.DOCTOR
        else:
            booking_source = Appointment.BookingSource.PATIENT_PORTAL

        appointment = book_appointment(
            doctor=doctor,
            branch=branch,
            patient=request.user,
            appointment_date=data["appointment_date"],
            start_time=data["start_time"],
            end_time=data["end_time"],
            appointment_type=data["appointment_type"],
            reason=data.get("reason", ""),
            booking_source=booking_source,
            created_by=request.user,
            organization=request.organization,
        )

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED,
        )


class AppointmentDetailView(generics.RetrieveAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def get_queryset(self):
        return Appointment.objects.filter(
            organization=self.request.organization
        ).select_related("doctor__user", "patient", "branch")


class ConfirmAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def post(self, request, pk):
        appointment = Appointment.objects.get(pk=pk, organization=request.organization)
        appointment = transition_status(appointment, Appointment.Status.CONFIRMED)
        return Response(AppointmentSerializer(appointment).data)


class CheckInAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def post(self, request, pk):
        appointment = Appointment.objects.get(pk=pk, organization=request.organization)
        appointment = transition_status(appointment, Appointment.Status.CHECKED_IN)
        return Response(AppointmentSerializer(appointment).data)


class CompleteAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def post(self, request, pk):
        appointment = Appointment.objects.get(pk=pk, organization=request.organization)
        appointment = transition_status(appointment, Appointment.Status.COMPLETED)
        return Response(AppointmentSerializer(appointment).data)


class CancelAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext]

    def post(self, request, pk):
        serializer = CancelAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = Appointment.objects.get(pk=pk, organization=request.organization)
        appointment = transition_status(
            appointment, Appointment.Status.CANCELLED,
            cancellation_reason=serializer.validated_data.get("cancellation_reason", ""),
        )
        return Response(AppointmentSerializer(appointment).data)


class AvailableSlotsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        serializer = AvailableSlotsSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        slots = get_available_slots(
            doctor_id=serializer.validated_data["doctor_id"],
            branch_id=serializer.validated_data["branch_id"],
            date=serializer.validated_data["date"],
        )
        return Response(slots)
