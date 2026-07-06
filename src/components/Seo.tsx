import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://liftflintshire.co.uk'
const DEFAULT_IMAGE = `${SITE_URL}/images/frc-castle.jpeg`

interface SeoProps {
  title: string
  description: string
  /** Route path starting with "/", used for the canonical URL */
  path: string
  ogTitle?: string
  ogDescription?: string
  image?: string
  noindex?: boolean
}

export function Seo({ title, description, path, ogTitle, ogDescription, image, noindex }: SeoProps) {
  const url = `${SITE_URL}${path === '/' ? '' : path}`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:site_name" content="Lift Flintshire CIC" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle ?? title} />
      <meta property="og:description" content={ogDescription ?? description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image ?? DEFAULT_IMAGE} />
      <meta property="og:locale" content="en_GB" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle ?? title} />
      <meta name="twitter:description" content={ogDescription ?? description} />
      <meta name="twitter:image" content={image ?? DEFAULT_IMAGE} />
    </Helmet>
  )
}
