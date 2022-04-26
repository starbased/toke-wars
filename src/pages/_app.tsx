import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Container } from "@chakra-ui/react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import { useState } from "react";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <title>Toke Wars</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Header />
          <main>
            <Container maxW="container.xl" my="10">
              <Component {...pageProps} />
            </Container>
          </main>
          <Footer />
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
