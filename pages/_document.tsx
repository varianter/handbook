import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class Doc extends Document {
  render() {
    return (
      <Html lang="no">
        <Head />
        <body>
          <Main />
          <NextScript />

          <script
            dangerouslySetInnerHTML={{
              __html: `
var _paq = _paq || [];
_paq.push(["disableCookies"]);
_paq.push(["trackPageView"]);
_paq.push(["enableLinkTracking"]);
(function() {
  var u = "https://variant.innocraft.cloud/";
  _paq.push(["setTrackerUrl", u + "piwik.php"]);
  _paq.push(["setSiteId", "2"]);
  var d = document,
    g = d.createElement("script"),
    s = d.getElementsByTagName("script")[0];
  g.type = "text/javascript";
  g.async = true;
  g.defer = true;
  g.src = u + "piwik.js";
  s.parentNode.insertBefore(g, s);
})();

// Remove old and outdated service workers.
// This should be removed at some point (when enough time has passed)
if (
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator
) {
  window.addEventListener("load", async function () {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (!registrations || !registrations.length) return;
    for (let registration of registrations) {
      await registration.unregister();
    }
    window.location.reload();
  });
}
`,
            }}
          />
        </body>
      </Html>
    );
  }
}
