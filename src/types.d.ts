// Augment JSX/HTML types for newer web platform features not yet in Astro's
// built-in type definitions (as of Astro 6.4 / TypeScript 6.0).

import type { HTMLAttributes } from "astro/types";

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends astroHTML.JSX.IntrinsicAttributes {
      /** CSS anchor positioning — https://developer.mozilla.org/en-US/docs/Web/CSS/anchor-name */
      anchor?: string;
    }
  }

  // Navigation API — not yet in the DOM lib used by this project.
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigation
  interface NavigationDestination {
    url: string;
  }

  interface NavigateEvent extends Event {
    destination: NavigationDestination;
    canIntercept: boolean;
    intercept(options?: { handler: () => Promise<void> }): void;
  }

  interface Navigation extends EventTarget {
    addEventListener(
      type: "navigate",
      listener: (event: NavigateEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void;
  }

  var navigation: Navigation;
}
