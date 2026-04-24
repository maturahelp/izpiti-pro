import type { Metadata } from 'next'

export const BRAND_LOGO_SRC = '/brand/maturahelp-logo.png'
export const BRAND_LOGO_ALT = 'MaturaHelp logo'

export const brandMetadataIcons: Metadata['icons'] = {
  icon: [
    {
      url: BRAND_LOGO_SRC,
      type: 'image/png',
      sizes: 'any',
    },
  ],
  shortcut: [BRAND_LOGO_SRC],
  apple: [BRAND_LOGO_SRC],
}
