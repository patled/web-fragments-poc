import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';

// Determine base href dynamically based on current path
// If running as fragment (path starts with /widget/), use /widget/
// Otherwise use / for standalone mode
function getBaseHref(): string {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    return path.startsWith('/widget/') ? '/widget/' : '/';
  }
  return '/';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: APP_BASE_HREF,
      useValue: getBaseHref(),
    },
  ],
};
