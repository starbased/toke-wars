import { Box, chakra, SimpleGrid } from "@chakra-ui/react";
import { FaBitcoin, FaDiscord, FaSkull, FaTwitter } from "react-icons/fa";
import { LinkCard } from "./LinkCard";

export function HomeResourcesCard() {
  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <chakra.h2 textAlign="center" fontSize="xl" pb={8} fontWeight="bold">
        Resources for Tokemak
      </chakra.h2>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={{ base: 5, lg: 8 }}>
        <LinkCard
          title="Follow on Twitter"
          url={"https://twitter.com/tokenreactor"}
          icon={<FaTwitter />}
        />
        <LinkCard
          title="View on CoinGecko"
          url={"https://coingecko.com/coins/tokemak"}
          icon={<FaBitcoin />}
        />
        <LinkCard
          title="Chat on Discord"
          url={"https://discord.com/invite/Z5f92tfzh4"}
          icon={<FaDiscord />}
        />
        <LinkCard
          title="Listen to Radio"
          url={"https://www.tokemak.radio"}
          icon={<FaSkull />}
        />
      </SimpleGrid>
    </Box>
  );
}
