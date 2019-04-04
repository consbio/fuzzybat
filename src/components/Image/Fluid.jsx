import React from 'react'
import PropTypes from 'prop-types'
import Img from 'gatsby-image'

import styled from 'util/style'

const Wrapper = styled.div`
  margin-top: 0;
  height: ${({ height }) => height};
  min-height: ${({ minHeight }) => minHeight};
  overflow: hidden;
  width: 100%;
  position: relative;
  overflow: hidden;
`

const StyledImage = styled(Img)`
  position: absolute !important;
  bottom: 0;
  top: 0;
  left: 0;
  right: 0;
`

const ImageCredits = styled.div`
  font-size: smaller;
  text-align: right;
  margin-right: 1rem;
`

const Fluid = ({ image, height, minHeight, credits }) => (
  <>
    <Wrapper height={height} minHeight={minHeight}>
      <StyledImage fluid={image} />
    </Wrapper>
    {credits ? (
      <ImageCredits>
        Photo:&nbsp;
        <a href={credits.url} target="_blank" rel="noopener noreferrer">
          {credits.author}
        </a>
      </ImageCredits>
    ) : null}
  </>
)

Fluid.propTypes = {
  image: PropTypes.any.isRequired,
  height: PropTypes.string,
  minHeight: PropTypes.string,
  credits: PropTypes.shape({
    url: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
  }),
}

Fluid.defaultProps = {
  height: '60vh',
  minHeight: '20rem',
  credits: null,
}

export default Fluid
