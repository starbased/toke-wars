import {
  Box,
  Button,
  chakra,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import { FaBitcoin, FaDiscord, FaTwitter } from "react-icons/fa";
import { DaoInformation } from "../constants";

interface LinkCardProps {
  title: string;
  url: string;
  icon: ReactElement;
}
function LinkCard({ title, url, icon }: LinkCardProps) {
  return (
    <LinkBox>
      <Button w={"full"} maxW={"md"} variant={"outline"} leftIcon={icon}>
        <LinkOverlay href={url} isExternal>
          {title}
        </LinkOverlay>
      </Button>
    </LinkBox>
  );
}

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
          icon={<FaTwitter size={"3em"} />}
        />
        <LinkCard
          title="View on CoinGecko"
          url={"https://coingecko.com/coins/" + coingecko}
          icon={<FaBitcoin size={"3em"} />}
        />
        <LinkCard
          title="Chat on Discord"
          url={"https://discord.gg/" + discord}
          icon={<FaDiscord size={"3em"} />}
        />
      </SimpleGrid>
    </Box>
  );
}
