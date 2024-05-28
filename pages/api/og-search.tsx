/* eslint-disable @next/next/no-img-element */
import { Resvg } from '@resvg/resvg-js';
import { NextApiRequest, NextApiResponse } from 'next';
import satori, { type Font } from 'satori';

import { readFile } from 'fs/promises';

import { join } from 'path';
import { Readable } from 'node:stream';
import algoliasearch from 'algoliasearch/lite';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_READ_KEY || '';
const searchClient = algoliasearch(appId, apiKey);

type Result = {
  title: string;
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { query } = req.query;
  console.log(query);
  if (!query) {
    return notfound(res);
  }

  const index = searchClient.initIndex('handbook_content');

  const result = await index.search<Result>(
    decodeURIComponent(query.toString()),
    {
      highlightPreTag: '<strong>',
      highlightPostTag: '</strong>',
    },
  );

  const first = result.hits[0];
  if (!first) {
    return notfound(res);
  }

  const highlightedText = first.content.substring(0, 255);

  if (!highlightedText) {
    return notfound(res);
  }

  const image = await satori(
    <div
      style={{
        color: '#ffffff',
        backgroundImage: getBackground(),
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        display: 'flex',
      }}
    >
      <div
        style={{
          padding: '2rem',
          paddingRight: '12rem',
          marginTop: '6rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1
          style={{
            fontFamily: 'Recoleta',
            fontWeight: 600,
            fontSize: '80px',
            lineHeight: 1.2,
          }}
        >
          {first.title}
        </h1>
        <p style={{ fontFamily: 'Graphik', fontSize: 32 }}>
          {highlightedText.trim()}[...]
        </p>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: await getFonts(),
    },
  );

  res.setHeader('Content-Type', 'image/png');
  const png = new Resvg(image).render().asPng();
  return res.end(png);
}

async function notfound(res: NextApiResponse) {
  const data = await fetch('https://www.variant.no/og-header-min.png');
  return Readable.fromWeb(data.body as any).pipe(res);
}

async function getFonts(): Promise<Font[]> {
  return [
    {
      data: await readFile(
        join(
          process.cwd(),
          'node_modules/@variant/profile/lib/typography/fonts/graphik/Graphik-Regular-Web.woff',
        ),
      ),
      name: 'Graphik',
      weight: 400,
      style: 'normal',
    },
    {
      data: await readFile(
        join(
          process.cwd(),
          'node_modules/@variant/profile/lib/typography/fonts/graphik/Graphik-Medium-Web.woff',
        ),
      ),
      name: 'Graphik',
      weight: 600,
      style: 'normal',
    },
    {
      data: await readFile(
        join(
          process.cwd(),
          'node_modules/@variant/profile/lib/typography/fonts/recoleta/3A95AC_6_0.ttf',
        ),
      ),
      name: 'Recoleta',
      weight: 600,
      style: 'normal',
    },
  ];
}

function getBackground() {
  return `url('data:image/png;base64,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')`;
}
