from django.contrib import admin

from .models import OrganizationSubscription, SubscriptionPlan


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ["name", "tier", "price_monthly", "max_doctors", "active"]


@admin.register(OrganizationSubscription)
class OrganizationSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["organization", "plan", "status"]
    list_filter = ["status"]
