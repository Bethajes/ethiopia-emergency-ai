from fastapi.testclient import TestClient


def test_health_reports_ok_when_database_is_up(client: TestClient, postgis_enabled: bool) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["database"] == "up"
    assert payload["service"] == "NileShield AI"
    if postgis_enabled:
        assert payload["postgis_version"]