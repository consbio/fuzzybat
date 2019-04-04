import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'rebass'
import styled, { themeGet } from 'util/style'

const Wrapper = styled.div`
  flex: 0 0 auto;
  width: 400px;
  border-right: 1px solid ${themeGet('colors.grey.800')};
  padding: 1rem;
`

const Sidebar = ({ selectGrid, setLocation }) => {
  const handleSelectGrid = () => {
    selectGrid('foo')
  }

  const handleSetLocation = () => {
    setLocation({
      latitude: Math.min(Math.random() * 10, 80),
      longitude: Math.min(Math.random() * 100, 180),
    })
  }

  return (
    <Wrapper>
      <p>sidebar content goes here</p>
      <Button variant="primary" onClick={handleSetLocation}>
        Click me
      </Button>
    </Wrapper>
  )
}

Sidebar.propTypes = {
  selectGrid: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
}

export default Sidebar
