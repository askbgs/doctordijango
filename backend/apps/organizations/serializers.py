from rest_framework import serializers

from .models import Branch, Department, Organization, OrganizationMembership


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            "id", "name", "slug", "logo", "email", "phone", "address",
            "city", "country", "timezone", "currency", "status",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = [
            "id", "organization", "name", "code", "address", "city",
            "phone", "email", "timezone", "active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            "id", "organization", "name", "description", "active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class MembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = OrganizationMembership
        fields = [
            "id", "user", "user_email", "user_name", "organization",
            "organization_name", "role", "branch", "active", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class MembershipBriefSerializer(serializers.ModelSerializer):
    organization_id = serializers.UUIDField(source="organization.id")
    organization_name = serializers.CharField(source="organization.name")
    organization_slug = serializers.CharField(source="organization.slug")

    class Meta:
        model = OrganizationMembership
        fields = ["organization_id", "organization_name", "organization_slug", "role"]
