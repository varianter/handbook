# Variant Handbook

## Text

Edit text by changing files in [content](./content).

## Development

`yarn` to install dependencies

`yarn dev` to run development server

### Architecture and design decisions

Organizing is done through module folders where all relevant files are located. This is to easer be able to remove/delete code and complete sets of code. However, there are some assets (e.g. manifest files and some images) which are more practical as public files (inside `public/`). These will be available as static files hosted on the root path.

Styles are used as CSS Modules with as specific naming as possible. If nested components, use [BEM naming convention](http://getbem.com/naming/).

Reusable or generic components should be moved to the [Styleguide monorepo](https://github.com/varianter/styleguide).

This site should be static and exportable as clean HTML.
