"""initial schema with postgis

Revision ID: 0001
Revises:
Create Date: 2026-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from geoalchemy2 import Geography

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        "disaster_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("event_type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("severity", sa.String(length=16), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column(
            "location",
            Geography(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
            comment="PostGIS point mirroring latitude/longitude for spatial queries",
        ),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "latitude >= -90 AND latitude <= 90", name="ck_latitude_range"
        ),
        sa.CheckConstraint(
            "longitude >= -180 AND longitude <= 180", name="ck_longitude_range"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_disaster_events_location", "disaster_events", ["location"], postgresql_using="gist"
    )
    op.create_index("ix_disaster_events_event_type", "disaster_events", ["event_type"])
    op.create_index("ix_disaster_events_severity", "disaster_events", ["severity"])
    op.create_index("ix_disaster_events_status", "disaster_events", ["status"])

    op.create_table(
        "emergency_reports",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("event_id", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(length=32), nullable=False),
        sa.Column("report_type", sa.String(length=32), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column(
            "location",
            Geography(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
            comment="PostGIS point mirroring latitude/longitude for spatial queries",
        ),
        sa.Column("severity", sa.String(length=16), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("verified", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "latitude >= -90 AND latitude <= 90", name="ck_latitude_range"
        ),
        sa.CheckConstraint(
            "longitude >= -180 AND longitude <= 180", name="ck_longitude_range"
        ),
        sa.ForeignKeyConstraint(["event_id"], ["disaster_events.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_emergency_reports_location",
        "emergency_reports",
        ["location"],
        postgresql_using="gist",
    )
    op.create_index("ix_emergency_reports_event_id", "emergency_reports", ["event_id"])
    op.create_index("ix_emergency_reports_source", "emergency_reports", ["source"])
    op.create_index("ix_emergency_reports_report_type", "emergency_reports", ["report_type"])
    op.create_index("ix_emergency_reports_severity", "emergency_reports", ["severity"])

    op.create_table(
        "resources",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resource_type", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column(
            "location",
            Geography(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
            comment="PostGIS point mirroring latitude/longitude for spatial queries",
        ),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "latitude >= -90 AND latitude <= 90", name="ck_latitude_range"
        ),
        sa.CheckConstraint(
            "longitude >= -180 AND longitude <= 180", name="ck_longitude_range"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_resources_location", "resources", ["location"], postgresql_using="gist")
    op.create_index("ix_resources_resource_type", "resources", ["resource_type"])
    op.create_index("ix_resources_status", "resources", ["status"])


def downgrade() -> None:
    op.drop_table("resources")
    op.drop_table("emergency_reports")
    op.drop_table("disaster_events")
    # The postgis extension is shared; it is intentionally left installed.