import logging

from .models import Notification

logger = logging.getLogger(__name__)


class NotificationService:
    @staticmethod
    def send(*, user, organization=None, channel, subject, message, metadata=None):
        notification = Notification.objects.create(
            user=user,
            organization=organization,
            channel=channel,
            subject=subject,
            message=message,
            metadata=metadata or {},
        )

        provider = _get_provider(channel)
        try:
            provider.send(notification)
            notification.status = Notification.Status.SENT
        except Exception:
            logger.exception("Failed to send notification %s", notification.id)
            notification.status = Notification.Status.FAILED
        notification.save(update_fields=["status"])
        return notification


def _get_provider(channel):
    providers = {
        Notification.Channel.EMAIL: EmailProvider(),
        Notification.Channel.SMS: SMSProvider(),
        Notification.Channel.WHATSAPP: WhatsAppProvider(),
        Notification.Channel.PUSH: PushProvider(),
    }
    return providers.get(channel, NoOpProvider())


class EmailProvider:
    def send(self, notification):
        from django.core.mail import send_mail
        send_mail(
            notification.subject,
            notification.message,
            None,
            [notification.user.email],
            fail_silently=False,
        )


class SMSProvider:
    def send(self, notification):
        logger.info("SMS provider not configured. Notification %s logged.", notification.id)


class WhatsAppProvider:
    def send(self, notification):
        logger.info("WhatsApp provider not configured. Notification %s logged.", notification.id)


class PushProvider:
    def send(self, notification):
        logger.info("Push provider not configured. Notification %s logged.", notification.id)


class NoOpProvider:
    def send(self, notification):
        logger.warning("No provider for channel. Notification %s skipped.", notification.id)
