# data/ — NileShield AI

Working directories for geospatial data. Contents are git-ignored; only the
`.gitkeep` files are tracked.

| Directory | Contents (planned) |
|---|---|
| `data/raw/` | Downloaded satellite tiles, drone frames, weather dumps, road/settlement extracts — immutable, never edited |
| `data/interim/` | Cloud-masked, reprojected, tiled intermediates produced by `ml/` |
| `data/geo/` | Vector reference layers: admin boundaries, road network, water bodies, flood zones, facilities |

Current status: empty. No imagery has been downloaded and no derived raster is
produced by the Step 1 build.

## Conventions to adopt in Step 2

- GeoTIFF: EPSG:4326 for storage, EPSG:3857 or a national grid for processing.
- Filenames: `<source>_<region>_<acquired:YYYYMMDD>_<version>.tif`.
- Every derived file records the source ids and processing parameters used to
  create it, so results can be reproduced.
- Large artefacts belong in object storage; `data/` is for local development.