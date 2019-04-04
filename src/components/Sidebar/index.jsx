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

const Sidebar = ({ selectGrid }) => {
  const handleSelectGrid = () => {
    selectGrid('foo')
  }

  return (
    <Wrapper>
      <p>sidebar content goes here</p>
      <Button variant="primary" onClick={handleSelectGrid}>
        Click me
      </Button>
    </Wrapper>
  )
}

Sidebar.propTypes = { selectGrid: PropTypes.func.isRequired }

export default Sidebar
