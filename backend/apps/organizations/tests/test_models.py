from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.organizations.models import Branch, Department, Organization, OrganizationMembership

User = get_user_model()


class OrganizationModelTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Clinic", slug="test-clinic", timezone="UTC")
        self.user = User.objects.create_user(email="admin@test.com", password="Test123!", first_name="Admin", last_name="User")

    def test_organization_str(self):
        self.assertEqual(str(self.org), "Test Clinic")

    def test_branch_creation(self):
        branch = Branch.objects.create(organization=self.org, name="Main", code="MAIN")
        self.assertEqual(str(branch), "Test Clinic - Main")

    def test_department_creation(self):
        dept = Department.objects.create(organization=self.org, name="Cardiology")
        self.assertEqual(str(dept), "Test Clinic - Cardiology")

    def test_membership_creation(self):
        membership = OrganizationMembership.objects.create(
            user=self.user, organization=self.org, role=OrganizationMembership.Role.ORGANIZATION_ADMIN,
        )
        self.assertTrue(membership.active)
        self.assertEqual(membership.role, "ORGANIZATION_ADMIN")

    def test_membership_unique_constraint(self):
        OrganizationMembership.objects.create(
            user=self.user, organization=self.org, role=OrganizationMembership.Role.ORGANIZATION_ADMIN,
        )
        with self.assertRaises(Exception):
            OrganizationMembership.objects.create(
                user=self.user, organization=self.org, role=OrganizationMembership.Role.ORGANIZATION_ADMIN,
            )


class TenantIsolationTests(TestCase):
    def setUp(self):
        self.org1 = Organization.objects.create(name="Org 1", slug="org-1")
        self.org2 = Organization.objects.create(name="Org 2", slug="org-2")
        Branch.objects.create(organization=self.org1, name="Branch 1", code="B1")
        Branch.objects.create(organization=self.org2, name="Branch 2", code="B2")

    def test_branches_filtered_by_org(self):
        self.assertEqual(Branch.objects.filter(organization=self.org1).count(), 1)
        self.assertEqual(Branch.objects.filter(organization=self.org2).count(), 1)

    def test_departments_isolated(self):
        Department.objects.create(organization=self.org1, name="Cardiology")
        self.assertEqual(Department.objects.filter(organization=self.org1).count(), 1)
        self.assertEqual(Department.objects.filter(organization=self.org2).count(), 0)
