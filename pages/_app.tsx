import { AppProps } from 'next/app';
import React from 'react';
import 'src/app.css';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

function MyApp({
  Component,
  pageProps,
}: AppProps<{ session: Session | null | undefined }>) {
  return (
    <React.StrictMode>
      <SessionProvider session={pageProps.session}>
        <main id="root">
          <Component {...pageProps} />
        </main>
      </SessionProvider>
    </React.StrictMode>
  );
}

export default MyApp;
