import withImages from 'next-images';

import { plugins as remarkPlugins } from './mdx-plugins/index.mjs';

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@mdx-js/react',
    remarkPlugins,
  },
});

export default withImages(
  withMDX({
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    images: {
      disableStaticImages: true,
    },
    webpack: (config) => {
      const oneOf = config.module.rules.find(
        (rule) => typeof rule.oneOf === 'object',
      );
      if (oneOf) {
        const moduleCssRule = oneOf.oneOf.find((rule) =>
          regexEqual(rule.test, /\.module\.css$/),
        );
        if (moduleCssRule) {
          const cssLoader = moduleCssRule.use.find(({ loader }) =>
            loader.includes('css-loader'),
          );
          if (cssLoader) {
            cssLoader.options.modules.mode = 'local';
          }
        }
      }

      config.module.rules.push({
        test: /\.(woff(2)?|ttf|eot)/,
        type: 'asset/resource',
        generator: {
          publicPath:
            process.env.NODE_ENV === 'development' ? '_next/' : '../../',
          filename: 'static/fonts/[name].[contenthash][ext]',
        },
      });

      return config;
    },
  }),
);

function regexEqual(x, y) {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
}

function mdx(pluginOptions = {}) {
  return (nextConfig = {}) => {
    const extension = pluginOptions.extension || /\.mdx$/;

    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        config.module.rules.push({
          test: extension,
          use: [
            options.defaultLoaders.babel,
            {
              loader: '@mdx-js/loader',
              options: pluginOptions.options,
            },
            './mdx-plugins/load-layout.js',
          ],
        });

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    });
  };
}
