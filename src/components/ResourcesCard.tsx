import { Box, chakra, SimpleGrid } from "@chakra-ui/react";
import { FaBitcoin, FaDiscord, FaTwitter } from "react-icons/fa";
import { LinkCard } from "./LinkCard";

type Props = {
  geckoData: {
    id: string;
    name: string;
    links: {
      chat_url: string[];
      twitter_screen_name: string;
    };
  };
};

export function ResourcesCard({ geckoData: tokenInfo }: Props) {
  return (
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <chakra.h2 textAlign="center" fontSize="xl" pb={8} fontWeight="bold">
        Resources for {tokenInfo?.name}
      </chakra.h2>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <LinkCard
          title="Follow on Twitter"
          url={"https://twitter.com/" + tokenInfo?.links.twitter_screen_name}
          icon={<FaTwitter />}
        />
        <LinkCard
          title="View on CoinGecko"
          url={"https://coingecko.com/coins/" + tokenInfo?.id}
          icon={<FaBitcoin />}
        />
        <LinkCard
          title="Chat on Discord"
          url={tokenInfo?.links.chat_url[0]}
          icon={<FaDiscord />}
        />
      </SimpleGrid>
    </Box>
  );
}
