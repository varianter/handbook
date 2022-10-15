# Variant Handbook

## Text

Edit text by changing files in [content](./content).

## Development

`yarn` to install dependencies

`yarn dev` to run development server

## Configuration

The handbook should run locally without any variables, but there are some features requiring them.
Without AZURE AD configuration, login won't work. Without ALGOLIA configuration indexing won't work.
These are how ever optional features and the handbook will work fine without them.

See [`.env.example`](./.env.example) for required environment variables:

```
# Get from Azure AD registered App settings (only required if you want to test login)
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# Random string for cookie secrets
JWT_COOKIE_SECRET=


# Settings for indexing (not required unless you're testing indexing)
BASE_URL=https://handbook.variant.no
ALGOLIA_APP_ID=
ALGOLIA_API_KEY=

# Used for searching by client. Public keys
NEXT_PUBLIC_ALGOLIA_APP_ID=WZBDX5TTC9
NEXT_PUBLIC_ALGOLIA_READ_KEY=184c48e3d13eb260eab5a8e980234778
```

If you have access to Vercel you can generate secrets by doing:

```
vercel env pull
```

### Architecture and design decisions

Organizing is done through module folders where all relevant files are located. This is to easer be able to remove/delete code and complete sets of code. However, there are some assets (e.g. manifest files and some images) which are more practical as public files (inside `public/`). These will be available as static files hosted on the root path.

Styles are used as CSS Modules with as specific naming as possible. If nested components, use [BEM naming convention](http://getbem.com/naming/).

Reusable or generic components should be moved to the [Styleguide monorepo](https://github.com/varianter/styleguide).

This site should be static and exportable as clean HTML.
