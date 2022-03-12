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
  // {
  //   addresses: ["0x42e61987a5cba002880b3cc5c800952a5804a1c5"],
  //   name: "SquidDAO",
  // },
  // { addresses: ["0xf2c58cca8ce82df7a2A4f7F936608d61f45a9a47"], name: "Gamma" },
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
];

export const FIRST_BLOCK = 12961612;

export const TOKE_CONTRACT = "0x2e9d63788249371f1DFC918a52f8d799F4a38C94";

export const T_TOKE_CONTRACT = "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930";

export const TOKE_STAKING_CONTRACT =
  "0x96F98Ed74639689C3A11daf38ef86E59F43417D3";
