#!/bin/bash

if [[ "$VERCEL_ENV" == "production" ]]
then
  echo "Production build. Indexing..."
  node search-index/index.mjs
  next build
else
  echo "Environment $VERCEL_ENV. Not indexing..."
  next build
fi
date