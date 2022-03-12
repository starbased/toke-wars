import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  chakra,
  Flex,
  Link,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Text,
  Stat,
  useColorModeValue,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";
import { FaBitcoin, FaDiscord, FaTwitter } from "react-icons/fa";
import { DaoInformation } from "../constants";

type BaseCardProps = {
  title: string;
  children: ReactNode;
};

export function BaseCard({ title, children }: BaseCardProps) {
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="xl"
      border="1px solid"
      borderColor={useColorModeValue("gray.800", "gray.500")}
      rounded="lg"
    >
      <Flex justifyContent="space-between">{children}</Flex>
    </Stat>
  );
}

interface LinkCardProps {
  title: string;
  url: string;
  icon: ReactNode;
}
function LinkCard({ title, url, icon }: LinkCardProps) {
  return (
    <Center>
      <LinkBox>
        <Button
          w={"full"}
          maxW={"md"}
          variant={"outline"}
          /* need to fix icons */
          leftIcon={<FaTwitter />}
        >
          <Center>
            <Text>
              <LinkOverlay href={url} isExternal>
                {title}
              </LinkOverlay>
            </Text>
          </Center>
        </Button>
      </LinkBox>
    </Center>
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
        />{" "}
        <LinkCard
          title="Chat on Discord"
          url={"https://discord.gg/" + discord}
          icon={<FaDiscord size={"3em"} />}
        />
      </SimpleGrid>
    </Box>
  );
}
