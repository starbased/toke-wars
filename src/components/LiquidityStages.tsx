type StageInfo = {
  title: string;
  description: string;
};

export const stageMap: Record<number, StageInfo> = {
  1: {
    title: "Incentivized Liquidity via Emissions",
    description:
      "This is your run of the mill liquidity for most DAOs. This would be the normal TOKEN-ETH pair on something like Uniswap or Sushiswap where the incentives are coming from the DOAs own token emissions.",
  },
  2: {
    title: "Tokemak Reactor Established",
    description:
      "Once a DAO has their own reactor they now have the tAsset generalized liquidity and is the first step in leveraging TOKE for liquidity.",
  },
  3: {
    title: "tAsset Staking Pool Established",
    description:
      "This stage is achieved when a DAO sets up their own staking pool for their tAsset. An example is Alchemix setting up a staking pool on their site that allows people to stake tALCX and earn ALCX rewards.",
  },
  4: {
    title: "Use Bonds to Acquire Its Liquidity as tAssets",
    description:
      "When a DAO leverages bonds to start acquiring their own tAssets is when stage 4 is achieved. An example of this would Alchemix using bonds to acquire their tALCX tAsset",
  },
  5: {
    title: "Provides Treasury Assets into Tokemak",
    description: "DAO decides to hold tAsstes in their treasury",
  },
  6: {
    title: "Vesting Contract Interacts Directly with Tokemak",
    description: "DAO holds tAssets in their vesting contracts",
  },
};

export function LiquidityStages() {
  return (
    <div>
      <h1>liquidity</h1>

      {Object.entries(stageMap).map(([stage, { title, description }]) => (
        <div key={stage} style={{ paddingTop: "25px" }}>
          <h2>Stage {stage}</h2>
          <div>{title}</div>
          <div>{description}</div>
        </div>
      ))}
    </div>
  );
}
