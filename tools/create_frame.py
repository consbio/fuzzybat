# Derived from code to create smaller sized grids here: https://www.sciencebase.gov/catalog/item/5bc0da13e4b0fc368eb6fee0

import os
import pandas as pd
import geopandas as gp
import numpy as np
from shapely.geometry import Point, box


# Bounds in which to generate grid, for a given custom CRS
CONFIG = {
    "akcan": {
        "bounds": [-4280000, -730000, 3370000, 3720000],
        "crs": {
            "proj": "aea",
            "lat_1": 55,
            "lat_2": 65,
            "lat_0": 50,
            "lon_0": -100,
            "x_0": 0,
            "y_0": 0,
            "datum": "NAD83",
            "units": "m",
            "no_defs": True,
        },
    },
    "conus": {
        "bounds": [-2363000, 276000, 2267000, 3166000],
        "crs": {
            "proj": "aea",
            "lat_1": 29.5,
            "lat_2": 45.5,
            "lat_0": 23,
            "lon_0": -96,
            "x_0": 0,
            "y_0": 0,
            "datum": "NAD83",
            "units": "m",
            "no_defs": True,
        },
    },
    "mex": {
        "bounds": [-1650000, 300000, 1400000, 2400000],
        "crs": {
            "proj": "aea",
            "lat_1": 17,
            "lat_2": 30,
            "lat_0": 12,
            "lon_0": -100,
            "x_0": 0,
            "y_0": 0,
            "datum": "NAD83",
            "units": "m",
            "no_defs": True,
        },
    },
    "hi": {
        "bounds": [-370000, 630000, 280000, 1080000],
        "crs": {
            "proj": "aea",
            "lat_1": 8,
            "lat_2": 18,
            "lat_0": 13,
            "lon_0": -157,
            "x_0": 0,
            "y_0": 0,
            "datum": "NAD83",
            "units": "m",
            "no_defs": True,
        },
    },
    "pr": {
        "bounds": [-170000, -50000, 230000, 100000],
        "crs": {
            "proj": "aea",
            "lat_1": 17,
            "lat_2": 19,
            "lat_0": 18,
            "lon_0": -66.5,
            "x_0": 0,
            "y_0": 0,
            "datum": "NAD83",
            "units": "m",
            "no_defs": True,
        },
    },
}

# Height or width of a cell in planar units for frame (typically meters)
size = 100000
src_dir = "../../data/batamp/grids/source"
frames = ("akcan", "mex", "conus", "hi", "pr")


radius = size / 2
km = int(size / 1000)


for frame in frames:
    print("Processing {}".format(frame))

    bounds = CONFIG[frame]["bounds"]
    # construct a lattice of centroids, starting from the lower left corner

    x = np.arange(bounds[0] + radius, bounds[2] + 1, size)
    y = np.arange(bounds[1] + radius, bounds[3] + 1, size)

    # derived from dstack example here: https://stackoverflow.com/questions/11144513/numpy-cartesian-product-of-x-and-y-array-points-into-single-array-of-2d-points
    points = np.dstack(np.meshgrid(x, y)).reshape(-1, 2)

    print("Creating {} cells".format(len(points)))

    df = pd.DataFrame(points, columns=["x", "y"])
    df["geometry"] = df.apply(
        lambda row: box(row.x - radius, row.y - radius, row.x + radius, row.y + radius),
        axis=1,
    )
    df = gp.GeoDataFrame(df, geometry="geometry", crs=CONFIG[frame]["crs"])[
        ["geometry"]
    ]

    # Project to geographic coordinates - takes WAY WAY too long, do this in ogr2ogr
    # print("projecting to Geographic...")
    # df = df.to_crs({"init": "EPSG:4326"})

    # df["long"] = df.centroid.x
    # df["lat"] = df.centroid.y

    id_field = "{0}_{1}KM".format(frame.upper(), km)[:10]  # truncated to 10 chars
    df[id_field] = df.index.astype("int")

    filename = "{0}/{1}_{2}km.shp".format(src_dir, frame, km)
    df.to_file(filename)
