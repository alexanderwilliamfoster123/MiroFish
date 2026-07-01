import React from 'react'

// Render a raw HTML/SVG string (used for the many inline SVG icons ported verbatim).
export default function Html({ tag = 'span', html, ...rest }) {
  const Tag = tag
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />
}
