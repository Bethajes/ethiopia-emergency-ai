from typing import Any

import pytest
from fastapi.testclient import TestClient
from pytest import approx
from sqlalchemy import text
from sqlalchemy.orm import Session

ADDIS_EVENT: dict[str, Any] = {
    "event_type": "flood",
    "title": "Test flood event",
    "description": "Inserted by the automated test suite.",
    "severity": "high",
    "confidence": 0.5,
    "status": "active",
    "latitude": 9.0192,
    "longitude": 38.7525,
}


def _create_event(client: TestClient, **overrides: Any) -> dict[str, Any]:
    response = client.post("/api/events", json={**ADDIS_EVENT, **overrides})
    assert response.status_code == 201, response.text
    return response.json()


def test_events_start_empty(client: TestClient) -> None:
    response = client.get("/api/events")

    assert response.status_code == 200
    assert response.json() == []


def test_create_and_get_event(client: TestClient) -> None:
    created = _create_event(client)

    response = client.get(f"/api/events/{created['id']}")

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == ADDIS_EVENT["title"]
    assert body["latitude"] == approx(ADDIS_EVENT["latitude"])
    assert body["confidence"] == approx(ADDIS_EVENT["confidence"])


def test_event_appears_in_list(client: TestClient) -> None:
    created = _create_event(client)

    response = client.get("/api/events")

    assert response.status_code == 200
    assert [event["id"] for event in response.json()] == [created["id"]]


def test_filter_events_by_status(client: TestClient) -> None:
    _create_event(client)
    _create_event(client, status="resolved", title="Resolved event")

    active = client.get("/api/events", params={"status": "active"})
    resolved = client.get("/api/events", params={"status": "resolved"})

    assert len(active.json()) == 1
    assert len(resolved.json()) == 1
    assert resolved.json()[0]["status"] == "resolved"


def test_missing_event_returns_error_envelope(client: TestClient) -> None:
    response = client.get("/api/events/999999")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_invalid_event_payload_is_rejected(client: TestClient) -> None:
    response = client.post("/api/events", json={**ADDIS_EVENT, "latitude": 999})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


def test_postgis_point_is_queryable(client: TestClient, db: Session, postgis_enabled: bool) -> None:
    """Confirms the geography column is populated, not just the lat/lon scalars."""
    if not postgis_enabled:
        pytest.skip("postgis extension is not installed")

    created = _create_event(client)

    row = db.execute(
        text(
            "SELECT ST_AsText(location), ST_Distance("
            "  location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography"
            ") AS distance_m FROM disaster_events WHERE id = :id"
        ),
        {"lon": ADDIS_EVENT["longitude"], "lat": ADDIS_EVENT["latitude"], "id": created["id"]},
    ).one()

    assert row[0] == f"POINT({ADDIS_EVENT['longitude']} {ADDIS_EVENT['latitude']})"
    assert row[1] == approx(0.0, abs=1e-6)