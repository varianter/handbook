import { defineConfig } from "astro/config";
import pagefind from "./src/integrations/pagefind.ts";

export default defineConfig({
  integrations: [pagefind()],
  redirects: {
    "/avdelinger": "/avdelinger/trondheim",
  },
  vite: {
    resolve: {
      alias: {
        src: "/src",
      },
    },
  },
});
