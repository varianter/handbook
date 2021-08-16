import { AppProps } from "next/app";
import React from "react";
import "src/app.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <main id="root">
        <Component {...pageProps} />
      </main>
    </React.StrictMode>
  );
}

export default MyApp;
