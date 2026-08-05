import { defineConfig } from "astro/config";
import { pagefindDev } from "./src/integrations/pagefind-dev.ts";

export default defineConfig({
	integrations: [pagefindDev()],
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
