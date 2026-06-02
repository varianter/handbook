import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  redirects: {
    '/avdelinger': '/avdelinger/trondheim',
  },
  vite: {
    resolve: {
      alias: {
        src: '/src',
      },
    },
  },
});
