import { RewardsHash__factory } from "../typechain";
import { useQuery } from "react-query";
import axios from "axios";
import knownCycleHashes from "../cache/cycleHashes.json";
import { useState } from "react";

import { UserInput } from "./RewardsUserInput";
import { Totals } from "./RewardsTotals";

import { Badge, Box } from "@chakra-ui/react";
import { Page } from "./Page";
import { provider } from "../util/providers";

export type CycleInfo = {
  payload: {
    cycle: number;
    amount: string;
  };
  summary: {
    breakdown: {
      description: string;
      amount: string;
    }[];
    cycleTotal: string;
  };
};

const contract = RewardsHash__factory.connect(
  "0x5ec3EC6A8aC774c7d53665ebc5DDf89145d02fB6",
  provider
);

// @ts-ignore
window.contract = contract;

export function getCycleHash(cycle: number, enabled = true) {
  return {
    queryKey: ["cycleHash", cycle],
    queryFn: () => contract.cycleHashes(cycle),
    enabled,
    initialData: knownCycleHashes[cycle],
  };
}

export function getCycleInfo(
  address: string,
  cycle: number,
  cycleHash?: string[]
) {
  return {
    queryKey: ["cycleInfo", cycleHash, address],
    queryFn: async () => {
      if (!cycleHash) throw Error();

      try {
        const { data } = await axios.get<CycleInfo>(
          `https://ipfs.tokemaklabs.xyz/ipfs/${cycleHash[1]}/${address}.json`
        );

        if (cycle === 0) {
          data.payload.cycle = 0;
          data.summary = {
            cycleTotal: data.payload.amount,
            breakdown: [
              {
                description: "DeGenesis",
                amount: data.payload.amount,
              },
            ],
          };
        }

        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return {
            payload: {
              cycle: cycle,
              amount: "0",
            },
            summary: {
              breakdown: [],
              cycleTotal: "0",
            },
          };
        }
        throw error;
      }
    },
    enabled: !!cycleHash && address !== "",
  };
}

export function Rewards() {
  const [address, setAddress] = useState("");

  const { data: latestCycle } = useQuery(
    "lastCycle",
    () => contract.latestCycleIndex(),
    { staleTime: 1000 * 60 * 60 } // 1 hour
  );

  return (
    <Page header="Rewards">
      <UserInput {...{ setAddress }} />
      <Box>
        {!latestCycle ? (
          <div>loading</div>
        ) : (
          <>
            {address !== "" ? (
              <>
                <Totals {...{ address, latestCycle }} />
              </>
            ) : (
              <Badge>Enter an address to continue</Badge>
            )}
          </>
        )}
      </Box>
    </Page>
  );
}
