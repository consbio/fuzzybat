import React from 'react'
import PropTypes from 'prop-types'
import { Image } from 'rebass'

import { Flex } from 'components/Grid'
import { OutboundLink, Link } from 'components/Link'
import LogoSVG from 'images/logo.svg'

import styled, { themeGet, themePx } from 'util/style'

const Wrapper = styled.div`
  border-bottom: 0.25rem solid ${themeGet('colors.primary.800')};
  padding: 0.5rem;
  flex: 0 0 auto;
`

const Title = styled.h1`
  margin: 0;

  & * {
    color: ${themeGet('colors.primary.800')};
    text-decoration: none;
  }
`

const Subtitle = styled.h3`
  margin: 0;
  font-size: 0.9rem;
  font-style: italic;
  color: ${themeGet('colors.primary.800')};

  a {
    color: ${themeGet('colors.primary.800')};
    text-decoration: underline;
  }
`

const SiteLogo = styled(Image).attrs({ src: LogoSVG })`
  margin-right: 0.25rem;
  height: 2.25rem;
`

const Header = ({ siteTitle }) => (
  <Wrapper as="header">
    <Flex alignItems="flex-start">
      <Link to="/">
        <SiteLogo />
      </Link>
      <div>
        <Link to="/">
          <Title>{siteTitle}</Title>
        </Link>
        <Subtitle>
          (a companion to{' '}
          <OutboundLink from="/" to="https://batamp.databasin.org/">
            BatAMP
          </OutboundLink>
          )
        </Subtitle>
      </div>
    </Flex>
  </Wrapper>
)

Header.propTypes = {
  siteTitle: PropTypes.string.isRequired,
}

export default Header
