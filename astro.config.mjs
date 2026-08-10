import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import pagefind from "./src/integrations/pagefind.ts";

export default defineConfig({
  integrations: [pagefind(), sitemap()],
  redirects: {
    "/avdelinger": "/avdelinger/trondheim",
  },
  site: "https://handbook.variant.no",
  vite: {
    resolve: {
      alias: {
        src: "/src",
      },
    },
  },
});
