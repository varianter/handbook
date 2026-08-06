declare global {
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
