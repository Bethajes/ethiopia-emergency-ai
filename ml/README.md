# ml/ — NileShield AI

Model and geospatial processing code will live here. **Nothing in this folder is
implemented yet** — the Step 1 build deliberately contains no model code, no
fake predictions and no placeholder inference stubs.

## Planned packages (Step 2+)

| Package | Purpose | Planned stack |
|---|---|---|
| `ml/satellite/` | Cloud/shadow masking, NDWI water segmentation, change detection over time series | PyTorch, OpenCV, Rasterio |
| `ml/flood_detection/` | Flood extent estimation and severity classification from satellite tiles | PyTorch |
| `ml/damage_detection/` | Drone-image damage assessment (roads, buildings, bridges) | PyTorch (detection/segmentation) |
| `ml/nlp_reports/` | Emergency-report classification, geolocation extraction, deduplication | PyTorch |
| `ml/fusion/` | Evidence fusion engine producing probability, severity, confidence, affected area | PyTorch, service code in backend |
| `ml/geospatial/` | Vector/raster utilities: reprojection, zonal statistics, road-network analysis | GeoPandas, Shapely, Rasterio |

## Rules for this directory

- Models must declare their input requirements (CRS, resolution, bands, tile size) explicitly.
- Trained weights and processed datasets are not committed; they live in
  `/data` and in object storage.
- Every model ships a versioned evaluation report before it is wired into the API.
- Inference output is written to the database through backend services; model
  code never writes to PostGIS directly.