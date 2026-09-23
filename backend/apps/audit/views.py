from rest_framework import generics, permissions

from common.permissions.roles import HasOrganizationContext, IsOrganizationAdmin

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationContext, IsOrganizationAdmin]

    def get_queryset(self):
        return AuditLog.objects.filter(
            organization=self.request.organization
        ).select_related("actor")
