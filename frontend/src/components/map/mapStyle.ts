import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  FilterSpecification,
  LineLayerSpecification,
  StyleSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";

import type { FeatureCollection } from "./geojson";

/**
 * Basemap.
 *
 * OpenStreetMap raster tiles are used because they need no API key, keeping
 * local development and CI free of provider accounts. Darkening is applied with
 * raster paint properties, which affect only this layer — disaster markers
 * stay at their alert colours.
 *
 * OSM's tile policy allows light development use with attribution, not bulk or
 * production traffic. Swap `BASEMAP_STYLE` for a hosted provider style (MapTiler,
 * Protomaps, OpenFreeMap, or an Esri/Maptiler raster endpoint) before any
 * deployment; nothing else in the app needs to change.
 */
export const BASEMAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#070b12" } },
    {
      id: "basemap",
      type: "raster",
      source: "osm",
      paint: {
        "raster-brightness-max": 0.28,
        "raster-brightness-min": 0,
        "raster-contrast": 0.2,
        "raster-saturation": -0.7,
      },
    },
  ],
};

interface BaseLayerSpec {
  /** Unique layer id; also used as the GeoJSON source id. */
  id: string;
  data: FeatureCollection;
  beforeId?: string;
  filter?: FilterSpecification;
}

/**
 * Declarative map layer contract. Consumers describe data and styling; the map
 * component owns source and layer lifecycle.
 */
export type MapLayerSpec =
  | (BaseLayerSpec & {
      kind: "circle";
      paint?: CircleLayerSpecification["paint"];
      layout?: CircleLayerSpecification["layout"];
    })
  | (BaseLayerSpec & {
      kind: "line";
      paint?: LineLayerSpecification["paint"];
      layout?: LineLayerSpecification["layout"];
    })
  | (BaseLayerSpec & {
      kind: "fill";
      paint?: FillLayerSpecification["paint"];
      layout?: FillLayerSpecification["layout"];
    })
  | (BaseLayerSpec & {
      kind: "symbol";
      paint?: SymbolLayerSpecification["paint"];
      layout?: SymbolLayerSpecification["layout"];
    });