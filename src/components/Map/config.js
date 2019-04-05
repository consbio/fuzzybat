const TILE_HOST = 'http://localhost:8001'

const config = {
  // Mapbox public token.  TODO: migrate to .env setting
  accessToken:
    'pk.eyJ1IjoiYmN3YXJkIiwiYSI6InJ5NzUxQzAifQ.CVyzbyOpnStfYUQ_6r8AgQ',
  center: [0, 0],
  zoom: 0,
  minZoom: 1,
  styleID: 'light-v9',
  padding: 0.1, // padding around bounds as a proportion
  sources: {
    grids: {
      type: 'vector',
      tiles: [`${TILE_HOST}/services/grids/tiles/{z}/{x}/{y}.pbf`],
      minzoom: 1,
      maxzoom: 8,
    },
  },
  layers: [
    {
      id: 'na_50km',
      source: 'grids',
      'source-layer': 'na_50km',
      minzoom: 1,
      maxzoom: 22,
      type: 'line',
      layout: {
        visibility: 'none',
      },
      paint: {
        'line-width': {
          base: 0.1,
          stops: [[1, 0.1], [5, 0.25], [6, 1], [8, 2], [10, 3]],
        },
        'line-opacity': {
          stops: [[1, 0.1], [5, 0.5], [8, 1]],
        },
        'line-color': '#004d84', // theme.colors.primary.500
      },
    },
  ],
}

export default config
