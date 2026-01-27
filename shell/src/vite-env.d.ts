/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'web-fragment': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        'fragment-id'?: string
        src?: string
      }
    }
  }
}

export {}
