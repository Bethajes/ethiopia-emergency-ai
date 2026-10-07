import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";

import { ETHIOPIA_CENTER, ETHIOPIA_ZOOM } from "@/lib/constants";

import type { MapFeature } from "./geojson";
import { BASEMAP_STYLE, type MapLayerSpec } from "./mapStyle";

export interface MapCanvasProps {
  /** [longitude, latitude] */
  center?: [number, number];
  zoom?: number;
  /** GeoJSON-backed layers: event points, disaster zones, blocked roads, sites. */
  layers?: readonly MapLayerSpec[];
  onFeatureClick?: (feature: MapFeature) => void;
  className?: string;
}

/**
 * Reusable MapLibre canvas centred on Ethiopia. Everything the future
 * pipelines need (disaster polygons, blocked roads, infrastructure points)
 * plugs in through the declarative `layers` prop, so no page owns map
 * internals.
 */
export function MapCanvas({
  center = ETHIOPIA_CENTER,
  zoom = ETHIOPIA_ZOOM,
  layers = [],
  onFeatureClick,
  className,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const managedLayerIdsRef = useRef<string[]>([]);
  const initialViewRef = useRef({ center, zoom });
  const clickHandlerRef = useRef(onFeatureClick);
  clickHandlerRef.current = onFeatureClick;

  const syncLayers = useCallback((map: MapLibreMap, specs: readonly MapLayerSpec[]) => {
    for (const layerId of managedLayerIdsRef.current) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(layerId)) map.removeSource(layerId);
    }

    for (const spec of specs) {
      map.addSource(spec.id, { type: "geojson", data: spec.data });
      const filter = spec.filter ? { filter: spec.filter } : {};
      switch (spec.kind) {
        case "circle":
          map.addLayer(
            {
              id: spec.id,
              type: "circle",
              source: spec.id,
              ...filter,
              ...(spec.paint ? { paint: spec.paint } : {}),
              ...(spec.layout ? { layout: spec.layout } : {}),
            },
            spec.beforeId,
          );
          break;
        case "line":
          map.addLayer(
            {
              id: spec.id,
              type: "line",
              source: spec.id,
              ...filter,
              ...(spec.paint ? { paint: spec.paint } : {}),
              ...(spec.layout ? { layout: spec.layout } : {}),
            },
            spec.beforeId,
          );
          break;
        case "fill":
          map.addLayer(
            {
              id: spec.id,
              type: "fill",
              source: spec.id,
              ...filter,
              ...(spec.paint ? { paint: spec.paint } : {}),
              ...(spec.layout ? { layout: spec.layout } : {}),
            },
            spec.beforeId,
          );
          break;
        case "symbol":
          map.addLayer(
            {
              id: spec.id,
              type: "symbol",
              source: spec.id,
              ...filter,
              ...(spec.paint ? { paint: spec.paint } : {}),
              ...(spec.layout ? { layout: spec.layout } : {}),
            },
            spec.beforeId,
          );
          break;
      }
    }

    managedLayerIdsRef.current = specs.map((spec) => spec.id);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const { center: initialCenter, zoom: initialZoom } = initialViewRef.current;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    // Style and tile failures are silent by default; surface them instead.
    map.on("error", (event) => {
      console.warn("[MapCanvas] map error:", event.error?.message ?? event);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      managedLayerIdsRef.current = [];
    };
    // The map instance is created once for the lifetime of the component.
  }, [syncLayers]);

  useEffect(() => {
    mapRef.current?.setCenter(center);
  }, [center]);

  useEffect(() => {
    mapRef.current?.setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => syncLayers(map, layers);
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.once("load", apply);
  }, [layers, syncLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onFeatureClick) return;

    const handler = (event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      const feature = event.features?.[0];
      if (feature) clickHandlerRef.current?.(feature as unknown as MapFeature);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onFeatureClick]);

  return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}