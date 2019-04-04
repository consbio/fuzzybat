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

  const handleSelectGrid = id => {
    setGrid(id)
  }

  return (
    <Layout>
      <SEO title="Home" />
      <Wrapper>
        <Sidebar selectGrid={handleSelectGrid} />
        <Map grid={grid} location={location} />
      </Wrapper>
    </Layout>
  )
}

export default MapPage
