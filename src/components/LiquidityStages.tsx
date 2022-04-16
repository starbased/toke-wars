import {
  VStack,
  Box,
  Heading,
  Button,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { FaMedium } from "react-icons/fa";
import { Page } from "./Page";

type StageInfo = {
  title: string;
  description: string;
};

export const stageMap: Record<number, StageInfo> = {
  1: {
    title: "Incentivized Liquidity via Emissions",
    description:
      "A DAO is in Stage 1 if it has incentivized liquidity, generally via emissions to an ABC/ETH or ABC/USDC Sushi/Uni LP pool (Pool 2)",
    /* "This is your run of the mill liquidity for most DAOs. This would be the normal TOKEN-ETH pair on something like Uniswap or Sushiswap where the incentives are coming from the DAO's own token emissions.", */
  },
  2: {
    title: "Tokemak Reactor Established",
    description:
      "A DAO is in Stage 2 once it has established a Tokemak reactor, enabling tAsset generalized liquidity (as a reminder, depositing assets into a Token Reactor gives the user a tAsset; users deposit ABC and receive tABC)",
    /* "Once a DAO has their own reactor they now have the tAsset generalized liquidity and is the first step in leveraging TOKE for liquidity.", */
  },
  3: {
    title: "tAsset Staking Pool Established",
    description:
      "A DAO is in Stage 3 once it sets up a tAsset staking pool for community provided liquidity (Pool t1)",
    /* "This stage is achieved when a DAO sets up their own staking pool for their tAsset. An example is Alchemix setting up a staking pool on their site that allows people to stake tALCX and earn ALCX rewards.", */
  },
  4: {
    title: "Use Bonds to Acquire Its Liquidity as tAssets",
    description:
      "A DAO is in Stage 4 if it uses Olympus Pro bonds as a service to purchase its liquidity as tAssets (Olympus Pro + Tokemak)",
    /* "When a DAO leverages bonds to start acquiring their own tAssets is when stage 4 is achieved. An example of this would Alchemix using bonds to acquire their tALCX tAsset", */
  },
  5: {
    title: "Provides Treasury Assets into Tokemak",
    description:
      "A DAO is in Stage 5 if it provides the assets in its treasury as an LP into Tokemak (and instead holds the tAssets in its treasury)",
    /* "DAO decides to hold tAssets in their treasury", */
  },
  6: {
    title: "Vesting Contract Interacts Directly with Tokemak",
    description:
      "A DAO is in Stage 6 once it modifies its vesting contract to interact with Tokemak and provides the escrowed assets as liquidity into Tokemak, instead holding tAssets in their vesting contracts",
    /* "DAO holds tAssets in their vesting contracts", */
  },
};

export function LiquidityStages() {
  return (
    <Page header="Stages of Liquidity">
      <LinkBox>
        <Button
          w={"full"}
          maxW={"md"}
          variant={"outline"}
          leftIcon={<FaMedium />}
        >
          <LinkOverlay
            href="https://medium.com/tokemak/the-evolution-of-daos-1692509bbb41"
            isExternal
          >
            Read More on "The Evolution of DAOs"
          </LinkOverlay>
        </Button>
      </LinkBox>

      <VStack spacing={6} align="stretch">
        {Object.entries(stageMap).map(([stage, { title, description }]) => (
          <Box
            maxW="xl"
            borderWidth="1px"
            borderRadius="lg"
            shadow="md"
            key={stage}
          >
            <Box p="6">
              <div key={stage}>
                <Heading as="h1" size="lg" pb={2}>
                  Stage {stage}
                </Heading>
                <Heading as="h2" size="md" pb={2}>
                  {title}
                </Heading>
                <div>{description}</div>
              </div>
            </Box>
          </Box>
        ))}
      </VStack>
    </Page>
  );
}
