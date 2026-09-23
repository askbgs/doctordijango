from django.db import models

from common.models import TimeStampedModel


class SubscriptionPlan(TimeStampedModel):
    class Tier(models.TextChoices):
        FREE = "FREE", "Free"
        STARTER = "STARTER", "Starter"
        PROFESSIONAL = "PROFESSIONAL", "Professional"
        ENTERPRISE = "ENTERPRISE", "Enterprise"

    name = models.CharField(max_length=100)
    tier = models.CharField(max_length=20, choices=Tier.choices, unique=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_doctors = models.PositiveIntegerField(default=1)
    max_staff = models.PositiveIntegerField(default=2)
    max_branches = models.PositiveIntegerField(default=1)
    max_monthly_appointments = models.PositiveIntegerField(default=100)
    features = models.JSONField(default=dict, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["price_monthly"]

    def __str__(self):
        return self.name


class OrganizationSubscription(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        PAST_DUE = "PAST_DUE", "Past Due"
        CANCELLED = "CANCELLED", "Cancelled"
        TRIAL = "TRIAL", "Trial"

    organization = models.OneToOneField(
        "organizations.Organization", on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TRIAL)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.organization.name} - {self.plan.name}"
