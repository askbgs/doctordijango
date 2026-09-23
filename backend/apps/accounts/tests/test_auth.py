from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = "/api/v1/auth/register/"
        self.login_url = "/api/v1/auth/login/"
        self.profile_url = "/api/v1/auth/profile/"
        self.user_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
        }

    def test_register_success(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()["data"]
        self.assertIn("tokens", data)
        self.assertEqual(data["user"]["email"], "test@example.com")

    def test_register_password_mismatch(self):
        data = {**self.user_data, "password_confirm": "wrong"}
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        self.client.post(self.register_url, self.user_data)
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user(email="login@example.com", password="TestPass123!", first_name="A", last_name="B")
        response = self.client.post(self.login_url, {"email": "login@example.com", "password": "TestPass123!"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]
        self.assertIn("access", data)
        self.assertIn("refresh", data)

    def test_login_wrong_password(self):
        User.objects.create_user(email="login@example.com", password="TestPass123!", first_name="A", last_name="B")
        response = self.client.post(self.login_url, {"email": "login@example.com", "password": "wrong"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_authenticated(self):
        user = User.objects.create_user(email="profile@example.com", password="TestPass123!", first_name="A", last_name="B")
        self.client.force_authenticate(user=user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["email"], "profile@example.com")

    def test_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password(self):
        user = User.objects.create_user(email="pw@example.com", password="OldPass123!", first_name="A", last_name="B")
        self.client.force_authenticate(user=user)
        response = self.client.post("/api/v1/auth/change-password/", {
            "old_password": "OldPass123!",
            "new_password": "NewPass456!",
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass456!"))
