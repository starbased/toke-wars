import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { Header } from "components/Header";
import { Footer } from "components/Footer";
import Head from "next/head";
import Script from "next/script";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { useRouter } from "next/router";
import { pageview } from "utils/analytics";

config.autoAddCss = false;

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

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

      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `}
          </Script>
        </>
      ) : null}

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
