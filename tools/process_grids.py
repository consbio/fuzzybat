"""Merge the various grids for different geographic areas into a single grid.

All grids were first projected to WGS84 using ogr2ogr.

This script standardizes the ID, merges, and applies the CONUS grid over the top of the others.  There are some seamlines, but the original centerpoint is retained for each cell.

Cells are selected within a 50km buffer around the US, Canada, and Mexico (created in ArcGIS).
"""


import os
import pandas as pd
import geopandas as gp
from geopandas import GeoDataFrame, GeoSeries
from shapely.geometry import Point


NA_BOUNDS = [
    -172,
    10,
    -50,
    83,
]  # Approx bounds of North America, ignoring the far north
FILENAME_PATTERN = "{grid}_{size}km_wgs84.shp"
ID_PATTERN = "{grid}_{size}KM"

src_dir = "../../data/batamp/grids/source"
out_dir = "../../data/batamp/grids/derived"
boundary_dir = "../../data/batamp/boundaries/derived"


# Load North America buffer and get rid of areas far away
na_df = gp.read_file(os.path.join(boundary_dir, "NorthAmerica_50km_buffer.shp"))
na_df = na_df.cx[slice(*NA_BOUNDS[:3:2]), slice(*NA_BOUNDS[1::2])]
na_df.sindex


size = 10

conus = None
merged = None
for grid in ("conus", "akcan", "mex", "hi", "pr"):
    print("reading {}".format(grid))
    df = gp.read_file(
        os.path.join(src_dir, FILENAME_PATTERN.format(grid=grid, size=size))
    )
    colmap = dict()
    colmap[ID_PATTERN.format(grid=grid.upper(), size=size)] = "id"
    df = df.rename(columns=colmap)
    df["source"] = grid

    if grid == "akcan":
        # crop to bounds of north america and get rid of bad geometries
        df = df.cx[slice(*NA_BOUNDS[:3:2]), slice(*NA_BOUNDS[1::2])]

        # there are bad geometries that wrap the antimeridian
        # select these using their centerpoint, and ignore them
        df = df.loc[(df.long >= NA_BOUNDS[0]) & (df.long <= NA_BOUNDS[2])]

    if grid == "conus":
        conus = df

    else:
        if merged is None:
            merged = df
        else:
            merged = merged.append(df, sort=False, ignore_index=True)


# get bounding rectangle of conus
conus_outer = GeoDataFrame(geometry=GeoSeries(conus.unary_union))

# cut conus from merged
print("Cutting CONUS out of others...")
merged.sindex
conus_outer.sindex
merged = gp.overlay(merged, conus_outer, how="difference")

# merge in conus
print("Merging CONUS in...")
merged = merged.append(conus, sort=False, ignore_index=True).reindex()
merged.sindex


# Construct points and select out those that fall in North America
print("Clipping to North America")
points = merged.copy()
points["point"] = points.apply(lambda row: Point(row.long, row.lat), axis=1)
points = points.set_geometry("point")[["point"]]

merged = merged[points.within(na_df.unary_union)]

# extract within North America
# print("Clipping to North America")
# clipped = gp.overlay(merged, na_df, how="intersection")
# # use this to extract out the original grid cells that overlap
# merged = merged.loc[clipped.index]


# For testing
print("Writing shapefile...")
merged.to_file(os.path.join(out_dir, "na_{}km_wgs84.shp".format(size)))

print("Writing GeoJSON...")
filename = os.path.join(out_dir, "na_{}km_wgs84.json".format(size))

# JSON cannot be overwritten
if os.path.exists(filename):
    os.remove(filename)

merged.to_file(filename, driver="GeoJSON")
