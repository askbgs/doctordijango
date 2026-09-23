from django.urls import path

from . import views

app_name = "patients"

urlpatterns = [
    path("patients/", views.PatientListView.as_view(), name="patient-list"),
    path("patients/me/", views.PatientMyProfileView.as_view(), name="patient-my-profile"),
    path("patients/<uuid:pk>/", views.PatientDetailView.as_view(), name="patient-detail"),
]
