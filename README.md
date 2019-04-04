# A simple tool for fuzzing coordinates of bat monitoring locations

## Data preparation

10 km and 50 km grids downloaded from [here](https://www.sciencebase.gov/catalog/item/5b5a164ce4b0610d7f4dcb8c).

Country boundaries were downloaded from [here](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/).

North America boundary: US, Mexico, and Canada boundaries were selected, dissolved, and buffered by 50km (geodesic) using ArcGIS.

Reproject everything to WGS84 using `ogr2ogr` (much faster than in geopandas). In `grids/source` folder:

```
ogr2ogr -t_srs EPSG:4326 conus_50km_wgs84.shp conus_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 akcan_50km_wgs84.shp akcan_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 mex_50km_wgs84.shp mex_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 hi_50km_wgs84.shp hi_mastersample_50km.shp
ogr2ogr -t_srs EPSG:4326 pr_50km_wgs84.shp pr_mastersample_50km.shp

ogr2ogr -t_srs EPSG:4326 conus_10km_wgs84.shp conus_mastersample_10km.shp
ogr2ogr -t_srs EPSG:4326 akcan_10km_wgs84.shp akcan_mastersample_10km.shp
ogr2ogr -t_srs EPSG:4326 mex_10km_wgs84.shp mex_mastersample_10km.shp
ogr2ogr -t_srs EPSG:4326 hi_10km_wgs84.shp hi_mastersample_10km.shp
ogr2ogr -t_srs EPSG:4326 pr_10km_wgs84.shp pr_mastersample_10km.shp

```

Convert to tiles. In root data folder

```
tippecanoe -f -Z5 -z8 -l na_10km -o tiles/na_10km.mbtiles grids/derived/na_10km_wgs84.json
tippecanoe -f -Z1 -z6 -l na_50km -o tiles/na_50km.mbtiles grids/derived/na_50km_wgs84.json
```

## Boundaries

Canadian electoral districts obtained from: https://www12.statcan.gc.ca/census-recensement/2011/geo/bound-limit/bound-limit-2011-eng.cfm (cartographic boundaries)

Mexican electoral districts obtained from: http://www.electiondataarchive.org/datacenter-gred.php
