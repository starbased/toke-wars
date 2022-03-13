import { Box, chakra, SimpleGrid } from "@chakra-ui/react";
import { FaBitcoin, FaDiscord, FaTwitter } from "react-icons/fa";
import { DaoInformation } from "../constants";
import { LinkCard } from "./LinkCard";

type Props = {
  dao: DaoInformation;
};

export function DaoResourcesCard({ dao }: Props) {
  const { name, twitter, coingecko, discord } = dao;
  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <chakra.h2 textAlign="center" fontSize="xl" pb={8} fontWeight="bold">
        Resources for {name}
      </chakra.h2>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <LinkCard
          title="Follow on Twitter"
          url={"https://twitter.com/" + twitter}
          icon={<FaTwitter />}
        />
        <LinkCard
          title="View on CoinGecko"
          url={"https://coingecko.com/coins/" + coingecko}
          icon={<FaBitcoin />}
        />
        <LinkCard
          title="Chat on Discord"
          url={"https://discord.gg/" + discord}
          icon={<FaDiscord />}
        />
      </SimpleGrid>
    </Box>
  );
}
