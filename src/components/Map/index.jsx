/* eslint-disable max-len, no-underscore-dangle */
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Box } from 'rebass'

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import styled from 'util/style'
import { hasWindow } from 'util/dom'
import { getCenterAndZoom } from 'util/map'
import config from './config'

const Relative = styled.div`
  position: relative;
  flex: 1 0 auto;
`
const Absolute = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
`

const Map = ({ bounds, grid, location }) => {
  // if there is no window, we cannot render this component
  if (!hasWindow) {
    return null
  }

  console.log('render map')

  const mapNode = useRef(null)
  let map = null

  useEffect(() => {
    console.log('construct map')
    const { accessToken, styleID, padding } = config

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

    map = new mapboxgl.Map({
      container: mapNode.current,
      style: `mapbox://styles/mapbox/${styleID}`,
      center: center || config.center,
      zoom: zoom || config.zoom,
    })
    window.map = map

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.remove()
    }
  }, [])

  useEffect(
    () => {
      console.log('location changed', location)
    },
    [location]
  )

  useEffect(
    () => {
      console.log('grid changed', grid)
    },
    [grid]
  )

  return (
    <Relative>
      <Absolute
      //   mt={['2rem', '2.5rem', '2.75rem']}
      //   ml={[0, '12rem', '16rem', '18rem']}
      >
        <div ref={mapNode} style={{ width: '100%', height: '100%' }} />
      </Absolute>
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
}

Map.defaultProps = {
  bounds: null,
  grid: null,
  location: null,
}

export default Map
