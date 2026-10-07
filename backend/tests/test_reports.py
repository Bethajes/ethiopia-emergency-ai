from typing import Any

from fastapi.testclient import TestClient

REPORT: dict[str, Any] = {
    "source": "citizen",
    "report_type": "flood",
    "description": "Water rising near the river bank.",
    "latitude": 9.0192,
    "longitude": 38.7525,
    "severity": "medium",
    "confidence": 0.3,
}


def test_create_report(client: TestClient) -> None:
    response = client.post("/api/reports", json=REPORT)

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["id"] >= 1
    assert body["verified"] is False
    assert body["event_id"] is None


def test_reports_start_empty(client: TestClient) -> None:
    assert client.get("/api/reports").json() == []


def test_create_report_linked_to_event(client: TestClient) -> None:
    event = client.post("/api/events", json={
        "event_type": "flood",
        "title": "Linked event",
        "severity": "high",
        "latitude": 9.0192,
        "longitude": 38.7525,
    }).json()

    response = client.post("/api/reports", json={**REPORT, "event_id": event["id"]})

    assert response.status_code == 201
    assert response.json()["event_id"] == event["id"]

    filtered = client.get("/api/reports", params={"event_id": event["id"]})
    assert len(filtered.json()) == 1


def test_invalid_report_payload_is_rejected(client: TestClient) -> None:
    response = client.post("/api/reports", json={**REPORT, "longitude": 400})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_unknown_enum_value_is_rejected(client: TestClient) -> None:
    response = client.post("/api/reports", json={**REPORT, "severity": "catastrophic"})

    assert response.status_code == 422


def test_unknown_event_id_is_rejected(client: TestClient) -> None:
    response = client.post("/api/reports", json={**REPORT, "event_id": 987654})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"