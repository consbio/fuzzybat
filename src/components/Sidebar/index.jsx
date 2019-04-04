import React from 'react'
import PropTypes from 'prop-types'

import { Flex } from 'components/Grid'
import { Button, ButtonGroup } from 'components/Button'
import styled, { themeGet } from 'util/style'

const Wrapper = styled.div`
  flex: 0 0 auto;
  width: 400px;
  border-right: 1px solid ${themeGet('colors.grey.800')};
  padding: 1rem;
`

const Step = styled.div`
  height: 2rem;
  width: 2rem;
  text-align: center;
  line-height: 1.4;
  margin-right: 0.5rem;
  border-radius: 4rem;
  background: ${themeGet('colors.grey.700')};
  color: #fff;
`

const Section = styled.section`
  &:not(:first-of-type) {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid ${themeGet('colors.grey.200')};
  }
`

const SectionHeader = styled(Flex).attrs({ alignItems: 'center' })`
  font-size: 1.3rem;
  font-weight: bold;
`

const StyledButtonGroup = styled(ButtonGroup)`
  margin-top: 2rem;
`

const Sidebar = ({ grid, selectGrid, setLocation }) => {
  const handleSetLocation = () => {
    setLocation({
      latitude: Math.min(Math.random() * 10, 80),
      longitude: Math.min(Math.random() * 100, 180),
    })
  }

  const buttonProps = {
    secondary: grid === null,
  }

  console.log(grid)

  return (
    <Wrapper>
      <Section>
        <SectionHeader>
          <Step>1</Step>
          <div>Select Grid</div>
        </SectionHeader>

        <StyledButtonGroup justifyContent="center">
          <Button
            {...buttonProps}
            primary={grid === 'grts'}
            onClick={() => selectGrid('grts')}
          >
            GRTS (5-10km)
          </Button>
          <Button
            {...buttonProps}
            primary={grid === '50km'}
            onClick={() => selectGrid('50km')}
          >
            50km
          </Button>
          {/* <Button
            {...buttonProps}
            primary={grid === '100km'}
            onClick={() => selectGrid('100km')}
          >
            100km
          </Button> */}
        </StyledButtonGroup>
      </Section>

      <Section>
        <SectionHeader>
          <Step>2</Step>
          <div>Enter coordinates</div>
        </SectionHeader>

        <Flex justifyContent="flex-end">
          <Button primary onClick={handleSetLocation}>
            Go to location
          </Button>
        </Flex>
      </Section>
    </Wrapper>
  )
}

Sidebar.propTypes = {
  grid: PropTypes.string,
  selectGrid: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
}

Sidebar.defaultProps = {
  grid: null,
}

export default Sidebar
