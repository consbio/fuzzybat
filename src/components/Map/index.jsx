/* eslint-disable max-len, no-underscore-dangle */
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { fromJS } from 'immutable'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import styled from 'util/style'
import { hasWindow } from 'util/dom'
import { getCenterAndZoom } from 'util/map'
import { networkInterfaces } from 'os'
import config from './config'

const TRANSPARENT = 'rgba(0,0,0,0)'

const Relative = styled.div`
  position: relative;
  flex: 1 0 auto;
`

const MapNote = styled.div`
  position: absolute;
  z-index: 1000;
  top: 0;
  left: 4rem;
  right: 4rem;
  // padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 2px 6px #666;
`

const Map = ({ bounds, grid, location, onSelectFeature }) => {
  // if there is no window, we cannot render this component
  if (!hasWindow) {
    return null
  }

  const { accessToken, styleID, padding, sources, layers } = config

  console.log('render map')

  const mapNode = useRef(null)
  const noteNode = useRef(null)
  const markerRef = useRef(null)
  const mapRef = useRef(null)
  const gridRef = useRef(grid)

  // set updated grid value to incoming prop so we can use it in the click handler below
  gridRef.current = grid

  useEffect(() => {
    let center = null
    let zoom = null

    // If bounds are available, use these to establish center and zoom when map first
    if (bounds && bounds.size === 4) {
      const { offsetWidth, offsetHeight } = mapNode
      const { center: boundsCenter, zoom: boundsZoom } = getCenterAndZoom(
        bounds,
        offsetWidth,
        offsetHeight,
        padding
      )
      center = boundsCenter
      zoom = boundsZoom
    }

    mapboxgl.accessToken = accessToken

    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: `mapbox://styles/mapbox/${styleID}`,
      center: center || config.center,
      zoom: zoom || config.zoom,
      minZoom: config.minZoom || 0,
    })
    mapRef.current = map
    window.map = map

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      // add sources
      Object.entries(sources).forEach(([id, source]) => {
        map.addSource(id, source)
      })

      // add layers
      layers.forEach(layer => {
        // add highlight layer for each
        const highlightLayer = fromJS(layer)
          .merge({
            id: `${layer.id}-highlight`,
            type: 'fill',
            layout: {},
            paint: {
              'fill-color': TRANSPARENT,
              'fill-opacity': 0.5,
            },
          })
          .toJS()
        map.addLayer(highlightLayer)

        // add layer last so that outlines are on top of highlight
        /* eslint-disable no-param-reassign */
        layer.layout.visibility = grid === layer.id ? 'visible' : 'none'
        map.addLayer(layer)
      })
    })

    map.on('click', e => {
      const { current: curGrid } = gridRef

      if (!curGrid) return
      const [feature] = map.queryRenderedFeatures(e.point, {
        layers: [`${curGrid}-highlight`],
      })
      if (feature) {
        const { id } = feature.properties
        updateHighlight(curGrid, id)

        onSelectFeature(feature.properties)
      }
    })

    map.on('zoomend', () => {
      console.log('zoom', map.getZoom())

      if (gridRef.current === 'na_grts' && map.getZoom() < 5) {
        noteNode.current.innerHTML = 'Zoom in further to see GRTS grid...'
      } else {
        noteNode.current.innerHTML = ''
      }
    })

    return () => {
      map.remove()
    }
  }, [])

  useEffect(
    () => {
      const { current: map } = mapRef
      const { current: marker } = markerRef

      if (!map.loaded()) return

      if (location !== null) {
        onSelectFeature(null)
        const { latitude, longitude } = location
        map.flyTo({ center: [longitude, latitude], zoom: 10 })

        map.once('moveend', () => {
          const point = map.project([longitude, latitude])
          const feature = getFeatureAtPoint(point)
          // source may still be loading, try again in 1 second
          if (!feature) {
            setTimeout(() => {
              getFeatureAtPoint(point)
            }, 1000)
          }
        })

        if (!marker) {
          markerRef.current = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map)
        } else {
          marker.setLngLat([longitude, latitude])
        }
      } else if (marker) {
        marker.remove()
        markerRef.current = null
      }
    },
    [location]
  )

  useEffect(
    () => {
      console.log('grid changed', grid)

      const { current: map } = mapRef
      if (!map.loaded()) return

      // clear out any previous highlights
      layers.forEach(({ id }) => {
        updateHighlight(id, null)
      })

      layers.forEach(({ id }) => {
        map.setLayoutProperty(
          id,
          'visibility',
          grid === id ? 'visible' : 'none'
        )
      })

      // update zoom in note
      if (gridRef.current === 'na_grts' && map.getZoom() < 5) {
        noteNode.current.innerHTML = 'Zoom in further to see GRTS grid...'
      } else {
        noteNode.current.innerHTML = ''
      }
    },
    [grid]
  )

  const updateHighlight = (gridID, id) => {
    const { current: map } = mapRef
    const layer = `${gridID}-highlight`

    if (id !== null) {
      map.setPaintProperty(layer, 'fill-color', [
        'match',
        ['get', 'id'],
        id,
        '#b5676d',
        TRANSPARENT,
      ])
    } else {
      map.setPaintProperty(layer, 'fill-color', TRANSPARENT)
    }
  }

  const getFeatureAtPoint = point => {
    const { current: map } = mapRef
    const { current: curGrid } = gridRef

    if (!(map && curGrid)) return null

    const [feature] = map.queryRenderedFeatures(point, {
      layers: [`${curGrid}-highlight`],
    })
    if (feature) {
      console.log('got feature at point', feature)
      updateHighlight(curGrid, feature.properties.id)
      onSelectFeature(feature.properties)
    }
    return feature
  }

  return (
    <Relative>
      <MapNote ref={noteNode} />
      <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
    </Relative>
  )
}

Map.propTypes = {
  bounds: PropTypes.arrayOf(PropTypes.number),
  grid: PropTypes.string,
  location: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  onSelectFeature: PropTypes.func,
}

Map.defaultProps = {
  bounds: null,
  grid: null,
  location: null,
  onSelectFeature: () => {},
}

export default Map
