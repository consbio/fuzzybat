import React, { useState } from 'react'

import Layout from 'components/Layout'
import SEO from 'components/SEO'
import Map from 'components/Map'
import Sidebar from 'components/Sidebar'
import { Flex } from 'components/Grid'

import styled from 'util/style'

const Wrapper = styled(Flex)`
  height: 100%;
`

const MapPage = () => {
  const [grid, setGrid] = useState(null)
  const [location, setLocation] = useState(null)

  console.log('map page render')

  const handleSetGrid = id => {
    setGrid(id)
  }

  const handleSetLocation = newLocation => {
    setLocation(newLocation)
  }

  return (
    <Layout>
      <SEO title="Home" />
      <Wrapper>
        <Sidebar selectGrid={handleSetGrid} setLocation={handleSetLocation} />
        <Map grid={grid} location={location} />
      </Wrapper>
    </Layout>
  )
}

export default MapPage
