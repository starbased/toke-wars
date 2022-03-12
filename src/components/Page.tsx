import { ReactNode } from "react";
import { Box, chakra } from "@chakra-ui/react";

export function Page({
  children,
  header,
}: {
  children: ReactNode;
  header?: string;
}) {
  return (
    <Box
      maxW="7xl"
      mx="auto"
      pt={5}
      px={{ base: 2, sm: 12, md: 17 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "25px",
      }}
    >
      {header ? (
        <chakra.h1 textAlign="center" fontSize="4xl" fontWeight="bold">
          {header}
        </chakra.h1>
      ) : null}

      {children}
    </Box>
  );
}
