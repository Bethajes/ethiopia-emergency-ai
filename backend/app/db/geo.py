"""Helpers for mapping coordinates onto PostGIS geography values."""

from geoalchemy2 import WKTElement


def point_geography(latitude: float, longitude: float) -> WKTElement:
    """SRID 4326 point for the geography columns (GeoJSON axis order: lon, lat)."""
    return WKTElement(f"POINT({longitude} {latitude})", srid=4326)