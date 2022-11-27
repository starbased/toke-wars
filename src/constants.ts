export type DaoInformation = {
  name: string;
};

export const DAOS: DaoInformation[] = [
  {
    name: "Olympus",
  },
  {
    name: "Frax",
  },
  {
    name: "ShapeShift",
  },
  {
    name: "Sushi",
  },
  {
    name: "Mycelium",
  },
  {
    name: "APWine",
  },
  {
    name: "Synthetix",
  },
  {
    name: "Redacted",
  },
  {
    name: "Alchemix",
  },
];

export const REACTORS = [
  ["0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84", "ALCX", "alchemix"],
  ["0xe7a7D17e2177f66D035d9D50A7f48d8D8E31532D", "OHM", "olympus"],
  ["0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36", "WETH", "weth"],
  ["0x15A629f0665A3Eb97D7aE9A7ce7ABF73AeB79415", "TCR", "tracer-dao"],
  ["0xf49764c9C5d644ece6aE2d18Ffd9F1E902629777", "SUSHI", "sushi"],
  ["0xADF15Ec41689fc5b6DcA0db7c53c9bFE7981E655", "FXS", "frax-share"],
  ["0x808D3E6b23516967ceAE4f17a5F9038383ED5311", "FOX", "shapeshift-fox-token"],
  ["0xDc0b02849Bb8E0F126a216A2840275Da829709B0", "APW", "apwine"],
  ["0x94671A3ceE8C7A12Ea72602978D1Bb84E920eFB2", "FRAX", "frax"],
  ["0x0CE34F4c26bA69158BC2eB8Bf513221e44FDfB75", "DAI", "dai"],
  ["0x9eEe9eE0CBD35014e12E1283d9388a40f69797A3", "LUSD", "liquity-usd"],
  ["0x482258099De8De2d0bda84215864800EA7e6B03D", "UST", "terrausd-wormhole"],
  ["0x03DccCd17CC36eE61f9004BCfD7a85F58B2D360D", "FEI", "fei-usd"],
  ["0xeff721Eae19885e17f5B80187d6527aad3fFc8DE", "SNX", "havven"],
  ["0x2e9F9bECF5229379825D0D3C1299759943BD4fED", "MIM", "magic-internet-money"],
  ["0x7211508D283353e77b9A7ed2f22334C219AD4b4C", "alUSD", "alchemix-usd"],
  ["0x2Fc6e9c1b2C07E18632eFE51879415a580AD22E1", "GAMMA", "gamma-strategies"],
  ["0x41f6a95Bacf9bC43704c4A4902BA5473A8B00263", "gOHM", "governance-ohm"],
];

export const TOKE_CONTRACT = "0x2e9d63788249371f1DFC918a52f8d799F4a38C94";

export const T_TOKE_CONTRACT = "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930";

export const TOKE_STAKING_CONTRACT =
  "0x96F98Ed74639689C3A11daf38ef86E59F43417D3";

export const TOKEMAK_MANAGER = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14";

export const BURN = "0x0000000000000000000000000000000000000000";

export const REWARDS_CONTRACT = "0x5ec3EC6A8aC774c7d53665ebc5DDf89145d02fB6";

export const GRAPH_COLORS = [
  "#63b598",
  "#ce7d78",
  "#ea9e70",
  "#a48a9e",
  "#c6e1e8",
  "#648177",
  "#0d5ac1",
  "#f205e6",
  "#f2510e",
  "#4ca2f9",
  "#a4e43f",
  "#d298e2",
  "#6119d0",
  "#d2737d",
  "#c0a43c",
  "#651be6",
  "#79806e",
  "#61da5e",
];

type StageInfo = {
  title: string;
  description: string;
};

export const STAGE_MAP: Record<number, StageInfo> = {
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
