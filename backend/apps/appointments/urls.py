from django.urls import path

from . import views

app_name = "appointments"

urlpatterns = [
    path("appointments/", views.AppointmentListView.as_view(), name="appointment-list"),
    path("appointments/book/", views.BookAppointmentView.as_view(), name="appointment-book"),
    path("appointments/availability/", views.AvailableSlotsView.as_view(), name="appointment-availability"),
    path("appointments/<uuid:pk>/", views.AppointmentDetailView.as_view(), name="appointment-detail"),
    path("appointments/<uuid:pk>/confirm/", views.ConfirmAppointmentView.as_view(), name="appointment-confirm"),
    path("appointments/<uuid:pk>/check-in/", views.CheckInAppointmentView.as_view(), name="appointment-checkin"),
    path("appointments/<uuid:pk>/complete/", views.CompleteAppointmentView.as_view(), name="appointment-complete"),
    path("appointments/<uuid:pk>/cancel/", views.CancelAppointmentView.as_view(), name="appointment-cancel"),
]
