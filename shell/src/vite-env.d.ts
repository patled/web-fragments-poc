/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

interface ImportMetaEnv {
  readonly VITE_APP_CLIENT_ID: string
  readonly VITE_AUTHORITY: string
  readonly VITE_PASSWORD_RESET_AUTHORITY?: string
  readonly VITE_B2C_SCOPES?: string
  readonly VITE_REDIRECT_URI: string
  readonly VITE_POST_LOGOUT_REDIRECT_URI?: string
  readonly VITE_KNOWN_AUTHORITIES?: string
  readonly VITE_CACHE_LOCATION?: 'localStorage' | 'sessionStorage' | 'memoryStorage'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

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
