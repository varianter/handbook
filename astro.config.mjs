import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { pagefindDev } from './src/integrations/pagefind-dev.ts';

export default defineConfig({
  integrations: [mdx(), pagefindDev()],
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
