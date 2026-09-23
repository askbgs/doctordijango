from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    error_payload = {
        "code": type(exc).__name__,
        "message": "",
    }

    if isinstance(response.data, dict):
        detail = response.data.get("detail")
        if detail:
            error_payload["message"] = str(detail)
        else:
            error_payload["message"] = "Validation error"
            error_payload["fields"] = response.data
    elif isinstance(response.data, list):
        error_payload["message"] = response.data[0] if response.data else "Unknown error"
    else:
        error_payload["message"] = str(response.data)

    response.data = error_payload
    return response
