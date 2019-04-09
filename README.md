# A simple tool for fuzzing coordinates of bat monitoring locations

## Data preparation

### GRTS 5-10km frames

NABat GRTS sampling frames (5-10km) downloaded from [here](https://www.sciencebase.gov/catalog/item/get/5b7aec2ce4b0f5d578845c90).
These frames are derived from the 5-10km North American grids, selected out for overlap with country / area boundary.

Reproject everything to WGS84 using `ogr2ogr` (much faster than in geopandas) and drop all unnecessary attributes.

In `grids` folder:

```
ogr2ogr -t_srs EPSG:4326 derived/conus_10km_wgs84.shp source/conus_mastersample_10km_attributed.shp -sql "SELECT GRTS_ID, lat, long, CONUS_10KM from conus_mastersample_10km_attributed"
ogr2ogr -t_srs EPSG:4326 derived/ak_10km_wgs84.shp source/ak_mastersample_10km_attributed.shp -sql "SELECT GRTS_ID, lat, long, AKCAN_10KM from ak_mastersample_10km_attributed"
ogr2ogr -t_srs EPSG:4326 derived/can_10km_wgs84.shp source/can_mastersample_10km_attributed.shp -sql "SELECT GRTS_ID, lat, long, AKCAN_10KM from can_mastersample_10km_attributed"
ogr2ogr -t_srs EPSG:4326 derived/mex_10km_wgs84.shp source/mex_mastersample_10km_attributed.shp -sql "SELECT GRTS_ID, lat, long, MEX10KM_ID as MEX_10KM from mex_mastersample_10km_attributed"
ogr2ogr -t_srs EPSG:4326 derived/hi_5km_wgs84.shp source/hi_mastersample_5km_attributed.shp -sql "SELECT GRTS_ID, lat, long, HI_5KM from hi_mastersample_5km_attributed"
ogr2ogr -t_srs EPSG:4326 derived/pr_5km_wgs84.shp source/pr_mastersample_5km_attributed.shp -sql "SELECT GRTS_ID, lat, long, PR_5KM from PR_mastersample_5km_attributed"
```

### 50km frames

50km frames downloaded from [here](https://www.sciencebase.gov/catalog/item/5b5a164ce4b0610d7f4dcb8c).

Reproject 50km frames to WGS84:

```
ogr2ogr -t_srs EPSG:4326 derived/conus_50km_wgs84.shp source/conus_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 derived/akcan_50km_wgs84.shp source/akcan_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 derived/mex_50km_wgs84.shp source/mex_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 derived/hi_50km_wgs84.shp source/hi_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 derived/pr_50km_wgs84.shp source/pr_mastersample_50km.shp
```

### 100km frames

Generated using `create_frame.py`.

Reproject 50km frames to WGS84:

```
ogr2ogr -t_srs EPSG:4326 derived/conus_100km_wgs84.shp source/conus_100km.shp
ogr2ogr -t_srs EPSG:4326 derived/akcan_100km_wgs84.shp source/akcan_100km.shp
ogr2ogr -t_srs EPSG:4326 derived/mex_100km_wgs84.shp source/mex_100km.shp
ogr2ogr -t_srs EPSG:4326 derived/hi_100km_wgs84.shp source/hi_100km.shp
ogr2ogr -t_srs EPSG:4326 derived/pr_100km_wgs84.shp source/pr_100km.shp
```

### Vector tiles

Create vector tiles for each grid level and then merge them together. In root folder of data directory:

```
tippecanoe -f -Z5 -z8 --no-tile-stats -ai -l na_grts -o tiles/na_grts.mbtiles grids/final/na_grts_wgs84.json
tippecanoe -f -Z1 -z8 --no-tile-stats -ai -l na_50km -o tiles/na_50km.mbtiles grids/final/na_50km_wgs84.json
tippecanoe -f -Z1 -z8 --no-tile-stats -ai -l na_100km -o tiles/na_100km.mbtiles grids/final/na_100km_wgs84.json

tile-join -f --no-tile-stats --no-tile-size-limit -o tiles/grids.mbtiles tiles/na_grts.mbtiles tiles/na_50km.mbtiles tiles/na_100km.mbtiles
```

## Boundaries

Canadian electoral districts obtained from: https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-2011-eng.cfm (cartographic boundaries)

Mexican electoral districts obtained from: http://www.electiondataarchive.org/datacenter-gred.php
