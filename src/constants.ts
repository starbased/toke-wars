export type DaoInformation = {
  addresses: string[];
  name: string;
  stage: number;
  twitter: string;
  coingecko: string;
  discord: string;
};

export const DAOS: DaoInformation[] = [
  {
    addresses: ["0x245cc372c84b3645bf0ffe6538620b04a217988b"],
    name: "Olympus",
    stage: 2,
    twitter: "OlympusDAO",
    coingecko: "olympus",
    discord: "bzFn5nstFB",
  },
  {
    addresses: ["0x5180db0237291a6449dda9ed33ad90a38787621c"],
    name: "Frax",
    stage: 2,
    twitter: "fraxfinance",
    coingecko: "frax",
    discord: "MTZu6Hf57d",
  },
  {
    addresses: ["0x90a48d5cf7343b08da12e067680b4c6dbfe551be"],
    name: "ShapeShift",
    stage: 5,
    twitter: "ShapeShift_io",
    coingecko: "shapeshift-fox-token",
    discord: "shapeshift",
  },
  {
    addresses: [
      "0x873ad91fA4F2aA0d557C0919eC3F6c9D240cDd05",
      "0xde50fb295549eda934d222e7a24d5a8dd132444f",
    ],
    name: "Lobis",
    stage: 4,
    twitter: "LobisHQ",
    coingecko: "lobis",
    discord: "lobishq",
  },
  {
    addresses: ["0xe94B5EEC1fA96CEecbD33EF5Baa8d00E4493F4f3"],
    name: "Sushi",
    stage: 2,
    twitter: "SushiSwap",
    coingecko: "sushi",
    discord: "MsVBwEc",
  },
  {
    addresses: [
      "0xa84918f3280d488eb3369cb713ec53ce386b6cba",
      "0x95E8C5a56ACc8064311d79946c7Be87a1e90d17f",
    ],
    name: "Tracer",
    stage: 2,
    twitter: "TracerDAO",
    coingecko: "tracer-dao",
    discord: "rWmrzgrbBp",
  },
  {
    addresses: ["0xDbbfc051D200438dd5847b093B22484B842de9E7"],
    name: "APWine",
    stage: 2,
    twitter: "APWineFinance",
    coingecko: "apwine",
    discord: "AxbH7sE6sc",
  },
  {
    addresses: ["0x99F4176EE457afedFfCB1839c7aB7A030a5e4A92"],
    name: "Synthetix",
    stage: 2,
    twitter: "synthetix_io",
    coingecko: "havven",
    discord: "invite/AEdUHzt",
  },
  {
    addresses: [
      "0x086C98855dF3C78C6b481b6e1D47BeF42E9aC36B",
      "0xA52Fd396891E7A74b641a2Cb1A6999Fcf56B077e",
    ],
    name: "Redacted",
    stage: 2,
    twitter: "redactedcartel",
    coingecko: "butterflydao",
    discord: "invite/thdzk4k5Fg",
  },
  {
    addresses: ["0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9"],
    name: "Alchemix",
    stage: 4,
    twitter: "AlchemixFi",
    coingecko: "alchemix",
    discord: "zAd6dzgwaj",
  },
  {
    addresses: ["0x73141d278a9c71d2ef2a0b83565e9d5728fa15cb"],
    name: "Congruent",
    stage: 1,
    twitter: "CongruentFi",
    coingecko: "congruent-dao-token",
    discord: "tsepr8rndw",
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

export const FIRST_BLOCK = 12961612;

export const TOKE_CONTRACT = "0x2e9d63788249371f1DFC918a52f8d799F4a38C94";

export const T_TOKE_CONTRACT = "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930";

export const TOKE_STAKING_CONTRACT =
  "0x96F98Ed74639689C3A11daf38ef86E59F43417D3";

export const TOKEMAK_MANAGER = "0xA86e412109f77c45a3BC1c5870b880492Fb86A14";

export const BURN = "0x0000000000000000000000000000000000000000";

export const REWARDS_CONTRACT = "0x5ec3EC6A8aC774c7d53665ebc5DDf89145d02fB6";
