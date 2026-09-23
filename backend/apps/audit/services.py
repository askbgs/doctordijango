from .models import AuditLog


def log_action(*, request=None, actor=None, organization=None, action, entity, entity_id="", metadata=None):
    ip_address = None
    user_agent = ""

    if request:
        actor = actor or request.user
        organization = organization or getattr(request, "organization", None)
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip_address = x_forwarded_for.split(",")[0].strip() if x_forwarded_for else request.META.get("REMOTE_ADDR")
        user_agent = request.META.get("HTTP_USER_AGENT", "")

    AuditLog.objects.create(
        actor=actor,
        organization=organization,
        action=action,
        entity=entity,
        entity_id=str(entity_id),
        ip_address=ip_address,
        user_agent=user_agent,
        metadata=metadata or {},
    )
