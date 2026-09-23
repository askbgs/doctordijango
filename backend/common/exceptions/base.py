from rest_framework.exceptions import APIException
from rest_framework import status


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Conflict"
    default_code = "conflict"


class SlotUnavailableError(ConflictError):
    default_detail = "The selected appointment slot is no longer available."
    default_code = "APPOINTMENT_SLOT_UNAVAILABLE"


class InvalidStatusTransitionError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid status transition."
    default_code = "INVALID_STATUS_TRANSITION"
