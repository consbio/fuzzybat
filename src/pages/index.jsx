import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { Button } from 'rebass'

import { Link, OutboundLink } from 'components/Link'
import Layout from 'components/Layout'
import SEO from 'components/SEO'
import { FluidImage } from 'components/Image'
import { Container } from 'components/Grid'
import styled from 'util/style'

const BodyText = styled.p`
  font-size: larger;
`

const IndexPage = ({ data: { headerImage } }) => (
  <Layout>
    <SEO title="Home" />
    <FluidImage
      image={headerImage.childImageSharp.fluid}
      height="20vh"
      minHeight="16rem"
      position="bottom"
      credits={{
        url:
          'https://www.flickr.com/photos/usfwshq/9413217529/in/album-72157634888764844/',
        author: 'USFWS/Ann Froschauer',
      }}
    />
    <Container paddingBottom="3rem">
      <h2>
        This tool helps you prepare information for bat monitoring efforts in
        North America, including:
      </h2>
      <ul>
        <li>
          <OutboundLink from="/" to="https://batamp.databasin.org/">
            Bat Acoustic Monitoring Portal
          </OutboundLink>
        </li>
        <li>
          <OutboundLink from="/" to="https://www.nabatmonitoring.org/">
            North American Bat Monitoring Program
          </OutboundLink>
        </li>
      </ul>

      <BodyText>
        This tool will help you &quot;fuzz&quot; the coordinates of your bat
        monitoring location, so that you can more easily share your data with
        other monitoring efforts.
        <br />
        <br />
        You can also use this tool to find the monitoring grid cell ID for your
        location.
      </BodyText>

      <Container style={{ textAlign: 'center' }}>
        <Button variant="primary">Get Started</Button>
      </Container>
    </Container>
  </Layout>
)

IndexPage.propTypes = {
  data: PropTypes.shape({
    headerImage: PropTypes.object.isRequired,
  }).isRequired,
}

export const pageQuery = graphql`
  query HomePageQuery {
    headerImage: file(relativePath: { eq: "9413217529_c1f7f7cc01_o_d.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 3200) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`

export default IndexPage
