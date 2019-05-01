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


def to_geojson(df, filename):
    # JSON cannot be overwritten, so delete it first
    if os.path.exists(filename):
        os.remove(filename)
    df.to_file(filename, driver="GeoJSON")


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

# Drop duplicates (there are some overlaps of same cells between AK and CA)
merged = merged.drop_duplicates(subset=["id", "src", "src_id"])

print("dissolving regions...")
# remove the ones that are completely covered by bounds of CONUS
regions = merged.dissolve(by="src")
conus = regions.loc[regions.index == "CONUS_10KM"][["geometry"]]
can_mex = merged.loc[merged.src.isin(("AKCAN_10KM", "MEX_10KM"))]

print("intersecting CA / MEX cells with CONUS to remove")
remove_ids = gp.sjoin(can_mex, conus, op="within").index
merged = merged.loc[~merged.index.isin(remove_ids)].copy()


grts_df = merged


# TEMP:
# print("reading GRTS")
# grts_df = gp.read_file(os.path.join(out_dir, "na_grts_wgs84.shp"))

print("creating GRTS centroids")
points = gp.GeoDataFrame(grts_df[["src"]], geometry=grts_df.centroid)
points.sindex


# ### Do a spatial join of GRTS grids to 50k and 100k grids
# # We did not use the master frame lookup of 10k -> 50k because the IDs were not correct for this version of the 50k grids
frames = ("akcan", "mex", "conus", "hi", "pr")
for parent_size in (50, 100):
    print("Processing {} grid".format(parent_size))
    merged = None

    for frame in frames:
        print("Reading {}...".format(frame))

        frame_name = frame.upper()
        parent_id_field = ID_PATTERN.format(frame=frame_name, size=parent_size)[
            :10
        ]  # names limited to 10 chars

        print("Reading parent grid")
        df = gp.read_file(
            os.path.join(
                derived_dir, FILENAME_PATTERN.format(frame=frame_name, size=parent_size)
            )
        )

        # Note: AKCAN grid has cells that wrap the dateline, get rid of these
        # Note: AKCAN grid has a multipolygon cell that needs to be exploded (over the dateline, so filtered out) (not needed, filtered out above)
        if frame_name == "AKCAN":
            df = df.loc[df.bounds.maxx < 0]
            # df = df.explode().reindex().reset_index()

        # Only pull in grid cells that interset with a GRTS cell from this region

        print("Spatial join...")

        grts_src = "{frame}_{grts_size}KM".format(
            frame=frame_name, grts_size=5 if frame in ("hi", "pr") else 10
        )

        df = (
            gp.sjoin(df, points[points.src == grts_src], op="contains", how="left")
            .dropna()
            .drop_duplicates([parent_id_field])
        )

        # standardize ID fields
        df["src"] = parent_id_field
        df["src_id"] = df[parent_id_field]
        df = df.drop(columns=[parent_id_field, "index_right"])

        if merged is None:
            merged = df
        else:
            merged = merged.append(df, ignore_index=True, sort=False)

    merged = merged.drop_duplicates(subset=["src", "src_id"])
    merged = merged.reindex()
    merged["id"] = merged.index.astype("str")  # to match GRTS_ID
    merged["long"] = merged.centroid.x
    merged["lat"] = merged.centroid.y

    # remove the ones that are completely covered by bounds of CONUS
    regions = merged.dissolve(by="src")
    conus = regions.loc[regions.index == "CONUS_{}KM".format(parent_size)[:10]][
        ["geometry"]
    ]

    can_mex = merged.loc[
        merged.src.isin(
            ("AKCAN_{}KM".format(parent_size)[:10], "MEX_{}KM".format(parent_size))
        )
    ]

    remove_ids = gp.sjoin(can_mex, conus, op="within").index
    merged = merged.loc[~merged.index.isin(remove_ids)].copy()

    print("Writing shapefile...")
    merged.to_file(os.path.join(out_dir, "na_{}km_wgs84.shp".format(parent_size)))

    print("Writing GeoJSON...")
    to_geojson(merged, os.path.join(out_dir, "na_{}km_wgs84.json".format(parent_size)))

    if parent_size == 50:
        na50_df = merged
    else:
        na100_df = merged

### Join GRTS to 50 and 100k grids
print("joining to 50k grid")
df = (
    gp.sjoin(points, na50_df, how="left")
    .rename(columns={"index_right": "na50k"})
    .reset_index()
    .drop_duplicates(subset="index")
    .set_index("index")
)

print("joining to 100k grid")
df = (
    gp.sjoin(df, na100_df, how="left")
    .rename(columns={"index_right": "na100k"})
    .reset_index()
    .drop_duplicates(subset="index")
    .set_index("index")
)
df = df.dropna()[["na50k", "na100k"]].astype("uint")

grts_df = grts_df.join(df, how="inner")


print("Writing GRTS shapefile...")
grts_df.to_file(os.path.join(out_dir, "na_grts_wgs84.shp"))
print("Writing GeoJSON...")
to_geojson(grts_df, filename=os.path.join(out_dir, "na_grts_wgs84.json"))
