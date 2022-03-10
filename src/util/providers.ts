import { providers } from "ethers";

export const provider = new providers.InfuraProvider(
  1,
  import.meta.env.VITE_INFURA_ID
);
