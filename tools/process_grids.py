"""Merge the various grids for different geographic areas into a single grid.

All grids were first projected to WGS84 using ogr2ogr.

This script standardizes the ID, merges, and applies the CONUS grid over the top of the others.  There are some seamlines, but the original centerpoint is retained for each cell.

Cells are selected within a 50km buffer around the US, Canada, and Mexico (created in ArcGIS).
"""


import os
import pandas as pd
import geopandas as gp
from geopandas import GeoDataFrame, GeoSeries


NA_BOUNDS = [
    -172,
    10,
    -50,
    83,
]  # Approx bounds of North America, ignoring the far north
FILENAME_PATTERN = "{frame}_{size}km_wgs84.shp"
ID_PATTERN = "{frame}_{size}KM"

src_dir = "../../data/batamp/grids/source"
derived_dir = "../../data/batamp/grids/derived"
out_dir = "../../data/batamp/grids/final"
boundary_dir = "../../data/batamp/boundaries/derived"


### Merge GRTS grids together
frames = ("ak", "can", "mex", "conus", "hi", "pr")
sizes = (10, 10, 10, 10, 5, 5)
merged = None
for frame, size in zip(frames, sizes):
    print("Reading {}...".format(frame))
    df = gp.read_file(
        os.path.join(derived_dir, FILENAME_PATTERN.format(frame=frame, size=size))
    )
    df["id"] = df.GRTS_ID
    src_id_field = ID_PATTERN.format(
        frame="AKCAN" if frame in ("ak", "can") else frame.upper(), size=size
    )

    # standardize source attributes for easier merging
    df["src"] = src_id_field
    df["src_id"] = df[src_id_field]
    df = df.drop(columns=[src_id_field])

    if merged is None:
        merged = df
    else:
        merged = merged.append(df, ignore_index=True, sort=False)

# For testing
print("Writing shapefile...")
merged.to_file(os.path.join(out_dir, "na_grts_wgs84.shp"))

print("Writing GeoJSON...")
filename = os.path.join(out_dir, "na_grts_wgs84.json")
# JSON cannot be overwritten, so delete it first
if os.path.exists(filename):
    os.remove(filename)
merged.to_file(filename, driver="GeoJSON")

### Do a spatial join of GRTS grids to 50k grids
# We did not use the master frame lookup of 10k -> 50k because the IDs were not correct for this version of the 50k grids

merged = None
parent_size = 50
for frame, size in zip(frames, sizes):
    print("Reading {}...".format(frame))

    is_AK_CAN = frame in ("ak", "can")
    frame_name = "AKCAN" if is_AK_CAN else frame.upper()
    src_id_field = ID_PATTERN.format(frame=frame_name, size=size)
    parent_id_field = ID_PATTERN.format(frame=frame_name, size=parent_size)

    grts_df = gp.read_file(
        os.path.join(derived_dir, FILENAME_PATTERN.format(frame=frame, size=size))
    )

    points = gp.GeoDataFrame(geometry=grts_df.centroid)

    print("Reading parent grid")
    df = gp.read_file(
        os.path.join(
            derived_dir, FILENAME_PATTERN.format(frame=frame_name, size=parent_size)
        )
    )

    # Note: AKCAN grid has cells that wrap the dateline, get rid of these
    # Note: AKCAN grid has a multipolygon cell that needs to be exploded (over the dateline, so filtered out)
    if frame_name == "AKCAN":
        df = df.loc[df.bounds.maxx < 0]
        # df = df.explode().reindex().reset_index()

    print("Spatial join...")
    df = (
        gp.sjoin(df, points, op="contains", how="left")
        # .drop(columns=["index_right"])
        .dropna().drop_duplicates([parent_id_field])
    )

    # standardize ID fields
    df["src"] = parent_id_field
    df["src_id"] = df[parent_id_field]
    df = df.drop(columns=[parent_id_field, "index_right"])

    if merged is None:
        merged = df
    else:
        merged = merged.append(df, ignore_index=True, sort=False)


merged = merged.reindex()
merged["id"] = merged.index

# For testing
print("Writing shapefile...")
merged.to_file(os.path.join(out_dir, "na_{}km_wgs84.shp".format(parent_size)))

print("Writing GeoJSON...")
filename = os.path.join(out_dir, "na_{}km_wgs84.json".format(parent_size))
# JSON cannot be overwritten, so delete it first
if os.path.exists(filename):
    os.remove(filename)
merged.to_file(filename, driver="GeoJSON")


### Merge 100km grids together
merged = None
for frame, size in zip(frames, sizes):
    print("Reading {}...".format(frame))

    # Select out the cells that contain GRTS cells
    grts_df = gp.read_file(
        os.path.join(derived_dir, FILENAME_PATTERN.format(frame=frame, size=size))
    )
    points = gp.GeoDataFrame(geometry=grts_df.centroid)

    is_AK_CAN = frame in ("ak", "can")
    frame_name = "AKCAN" if is_AK_CAN else frame.upper()
    src_id_field = ID_PATTERN.format(frame=frame_name, size=100)[:10]

    df = gp.read_file(
        os.path.join(derived_dir, FILENAME_PATTERN.format(frame=frame_name, size=100))
    )

    # Add lat / long fields
    df["long"] = df.centroid.x
    df["lat"] = df.centroid.y

    # Note: AKCAN grid has cells that wrap the dateline, get rid of these
    if frame_name == "AKCAN":
        df = df.loc[df.bounds.maxx < 0]

    print("Spatial join...")
    df = (
        gp.sjoin(df, points, op="contains", how="left")
        .dropna()
        .drop_duplicates([src_id_field])
    )

    # standardize source attributes for easier merging
    df["src"] = src_id_field
    df["src_id"] = df[src_id_field]
    df = df.drop(columns=[src_id_field, "index_right"])

    if merged is None:
        merged = df
    else:
        merged = merged.append(df, ignore_index=True, sort=False)

merged = merged.reindex()
merged["id"] = merged.index

# For testing
print("Writing shapefile...")
merged.to_file(os.path.join(out_dir, "na_100km_wgs84.shp"))

print("Writing GeoJSON...")
filename = os.path.join(out_dir, "na_100km_wgs84.json")
# JSON cannot be overwritten, so delete it first
if os.path.exists(filename):
    os.remove(filename)
merged.to_file(filename, driver="GeoJSON")
