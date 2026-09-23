class TenantMiddleware:
    """Attaches the user's active organization to the request when available."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.organization = None
        if hasattr(request, "user") and request.user.is_authenticated:
            from apps.organizations.models import OrganizationMembership

            org_id = request.headers.get("X-Organization-Id")
            if org_id:
                membership = (
                    OrganizationMembership.objects.filter(
                        user=request.user, organization_id=org_id, active=True
                    )
                    .select_related("organization")
                    .first()
                )
                if membership:
                    request.organization = membership.organization
                    request.membership = membership
        return self.get_response(request)
