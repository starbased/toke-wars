import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
