import { Page } from "components/Page";
import { faMedium } from "@fortawesome/free-brands-svg-icons";
import { LinkCard } from "components/LinkCard";
import { Card } from "components/Card";

export default function Index() {
  return (
    <Page header="Stages of Liquidity" className="items-center">
      <LinkCard
        title={'Read More on "The Evolution of DAOs"'}
        url="https://medium.com/tokemak/the-evolution-of-daos-1692509bbb41"
        icon={faMedium}
      />

      {Object.entries(stageMap).map(([stage, { title, description }]) => (
        <Card className="w-full md:w-2/3" key={stage}>
          <h1>Stage {stage}</h1>
          <h2>{title}</h2>
          <p>{description}</p>
        </Card>
      ))}
    </Page>
  );
}

type StageInfo = {
  title: string;
  description: string;
};

export const stageMap: Record<number, StageInfo> = {
  1: {
    title: "Incentivized Liquidity via Emissions",
    description:
      "A DAO is in Stage 1 if it has incentivized liquidity, generally via emissions to an ABC/ETH or ABC/USDC Sushi/Uni LP pool (Pool 2)",
  },
  2: {
    title: "Tokemak Reactor Established",
    description:
      "A DAO is in Stage 2 once it has established a Tokemak reactor, enabling tAsset generalized liquidity (as a reminder, depositing assets into a Token Reactor gives the user a tAsset; users deposit ABC and receive tABC)",
  },
  3: {
    title: "tAsset Staking Pool Established",
    description:
      "A DAO is in Stage 3 once it sets up a tAsset staking pool for community provided liquidity (Pool t1)",
  },
  4: {
    title: "Use Bonds to Acquire Its Liquidity as tAssets",
    description:
      "A DAO is in Stage 4 if it uses Olympus Pro bonds as a service to purchase its liquidity as tAssets (Olympus Pro + Tokemak)",
  },
  5: {
    title: "Provides Treasury Assets into Tokemak",
    description:
      "A DAO is in Stage 5 if it provides the assets in its treasury as an LP into Tokemak (and instead holds the tAssets in its treasury)",
  },
  6: {
    title: "Vesting Contract Interacts Directly with Tokemak",
    description:
      "A DAO is in Stage 6 once it modifies its vesting contract to interact with Tokemak and provides the escrowed assets as liquidity into Tokemak, instead holding tAssets in their vesting contracts",
  },
};
