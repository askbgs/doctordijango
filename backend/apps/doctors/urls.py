from django.urls import path

from . import views

app_name = "doctors"

urlpatterns = [
    path("doctors/", views.DoctorListCreateView.as_view(), name="doctor-list"),
    path("doctors/<uuid:pk>/", views.DoctorDetailView.as_view(), name="doctor-detail"),
    path("public/doctors/", views.DoctorPublicListView.as_view(), name="doctor-public-list"),
    path("public/doctors/<uuid:pk>/", views.DoctorPublicDetailView.as_view(), name="doctor-public-detail"),
]
