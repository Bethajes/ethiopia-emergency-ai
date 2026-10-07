"""Integration tests.

They run against the PostgreSQL/PostGIS database configured through
DATABASE_URL. Tables are created from the ORM metadata when missing so the suite
is self-contained against a migrated (or empty) database.

Warning: every test truncates `disaster_events`, `emergency_reports` and
`resources`, so point DATABASE_URL at a scratch database before running the
suite against anything you care about.
"""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import Session

import app.models  # noqa: F401  (registers tables on Base.metadata)
from app.db.session import Base, SessionLocal, engine


@pytest.fixture(scope="session", autouse=True)
def schema() -> Iterator[None]:
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client() -> TestClient:
    from app.main import app

    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def db() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def _truncate(db: Session) -> None:
    db.rollback()
    for table in ("emergency_reports", "disaster_events", "resources"):
        db.execute(text(f"DELETE FROM {table}"))
    db.commit()


@pytest.fixture(autouse=True)
def clean_tables(db: Session) -> Iterator[None]:
    """Isolate every test from rows left in the development database."""
    _truncate(db)
    yield
    _truncate(db)


@pytest.fixture
def postgis_enabled(db: Session) -> bool:
    count = db.execute(
        text("SELECT COUNT(*) FROM pg_extension WHERE extname = 'postgis'")
    ).scalar()
    return bool(count)