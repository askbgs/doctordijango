from django.urls import path

from . import views

app_name = "scheduling"

urlpatterns = [
    path("schedules/", views.ScheduleListCreateView.as_view(), name="schedule-list"),
    path("schedules/<uuid:pk>/", views.ScheduleDetailView.as_view(), name="schedule-detail"),
    path("leaves/", views.LeaveListCreateView.as_view(), name="leave-list"),
    path("leaves/<uuid:pk>/", views.LeaveDetailView.as_view(), name="leave-detail"),
]
