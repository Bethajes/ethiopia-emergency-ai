/** Minimal GeoJSON types, scoped to what the map component consumes. */

export type Position = [number, number];

export interface PointFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: Position };
  properties: Record<string, unknown> | null;
}

export interface LineFeature {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: Position[] };
  properties: Record<string, unknown> | null;
}

export interface PolygonFeature {
  type: "Feature";
  geometry: { type: "Polygon"; coordinates: Position[][] };
  properties: Record<string, unknown> | null;
}

export type MapFeature = PointFeature | LineFeature | PolygonFeature;

export interface FeatureCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

export const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function pointsToFeatureCollection(
  points: readonly { longitude: number; latitude: number; [key: string]: unknown }[],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
      properties: { ...point },
    })),
  };
}

export function polygonToFeature(
  ring: readonly Position[],
  properties: Record<string, unknown> = {},
): PolygonFeature {
  const closed = ring.length > 0 && samePosition(ring[0] as Position, ring[ring.length - 1] as Position)
    ? [...ring]
    : [...ring, ring[0] as Position];
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [closed] },
    properties,
  };
}

export function lineToFeature(
  coordinates: readonly Position[],
  properties: Record<string, unknown> = {},
): LineFeature {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [...coordinates] },
    properties,
  };
}

function samePosition(a: Position, b: Position): boolean {
  return a[0] === b[0] && a[1] === b[1];
}