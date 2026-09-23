from django.urls import path

from . import views

app_name = "organizations"

urlpatterns = [
    path("", views.OrganizationListCreateView.as_view(), name="organization-list"),
    path("<uuid:pk>/", views.OrganizationDetailView.as_view(), name="organization-detail"),
    path("branches/", views.BranchListCreateView.as_view(), name="branch-list"),
    path("branches/<uuid:pk>/", views.BranchDetailView.as_view(), name="branch-detail"),
    path("departments/", views.DepartmentListCreateView.as_view(), name="department-list"),
    path("departments/<uuid:pk>/", views.DepartmentDetailView.as_view(), name="department-detail"),
    path("memberships/", views.MembershipListCreateView.as_view(), name="membership-list"),
    path("memberships/<uuid:pk>/", views.MembershipDetailView.as_view(), name="membership-detail"),
]
