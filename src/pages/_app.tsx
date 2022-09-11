import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { Header } from "components/Header";
import { Footer } from "components/Footer";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <title>Toke Wars</title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content="Informative Tokemak dashboard centering around DAO accumulation"
        />
      </Head>
      <Header />

      <div className="overflow-y-auto flex-1">
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </div>
      <Footer />
    </>
  );
}

export default MyApp;
