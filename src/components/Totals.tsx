import { useQueries } from "react-query";
import { formatEther } from "ethers/lib/utils";
import orderBy from "lodash/orderBy";
import {
  Box,
  chakra,
  Divider,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  StatHelpText,
  StatNumber,
  Table,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Graph } from "./Graph";
import { CycleInfo } from "./CycleInfo";
import knownCycleHashes from "../cache/cycleHashes.json";
import axios from "axios";
import { useTokePrice } from "../util/api/tokemak";
import { BaseCard } from "./DaoDetailsCard";
import { getProvider } from "../util";
import { formatMoney, formatNumber } from "../util/maths";
import { REWARDS_CONTRACT } from "../constants";
import { RewardsHash__factory } from "../typechain";

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

export function getCycleHash(cycle: number, enabled = true) {
  return {
    queryKey: ["cycleHash", cycle],
    queryFn: () => {
      const contract = RewardsHash__factory.connect(
        REWARDS_CONTRACT,
        getProvider()
      );

      return contract.cycleHashes(cycle);
    },
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
          `https://ipfs.tokemaklabs.xyz/ipfs/${
            cycleHash[1]
          }/${address.toLowerCase()}.json`
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

type Props = {
  latestCycle: number;
  address: string;
};

export function Totals({ latestCycle, address }: Props) {
  const toke_price = useTokePrice();
  const cycleArray = Array.from(Array((latestCycle || -1) + 1).keys());

  const cycleHashes = useQueries(
    cycleArray.map((cycle) => getCycleHash(cycle, !!latestCycle))
  );

  const rewards = useQueries(
    cycleHashes.map(({ data: cycleHash }, i) =>
      getCycleInfo(address, i, cycleHash)
    )
  );

  //Not returning on loading or idle looks interesting to see the data populating
  //but is pretty bad for performance so just show nothing or loading till done
  const idleFn = ({ isIdle }: { isIdle: boolean }) => isIdle;
  const idle = cycleHashes.some(idleFn) || rewards.some(idleFn);

  if (idle) {
    return null;
  }

  const loadingFn = ({ isLoading }: { isLoading: boolean }) => isLoading;
  const loading = cycleHashes.some(loadingFn) || rewards.some(loadingFn);

  if (loading) {
    return (
      <div>
        <Stack>
          <chakra.h2>Waiting for Cycle Index</chakra.h2>
          <Skeleton width="200px" height="60px" />
          <Skeleton width="200px" height="40px" />
          <Skeleton width="200px" height="60px" />
          <Skeleton width="200px" height="40px" />
          <Skeleton width="200px" height="60px" />
          <Skeleton width="200px" height="40px" />
        </Stack>
      </div>
    );
  }

  const total = rewards
    .map(({ data }) => data?.summary?.cycleTotal)
    .reduce<string | bigint>((a, b = "0") => BigInt(a) + BigInt(b), "0");

  const byToken: { [k: string]: bigint } = {};

  for (let { data } of rewards) {
    const breakdowns = data?.summary.breakdown;
    if (breakdowns === undefined) continue;

    for (let { description, amount } of breakdowns) {
      byToken[description] =
        BigInt(byToken[description] || "0") + BigInt(amount);
    }
  }

  const formattedTotal = formatEther(total || 0);

  let rewardsThisCycle = "";

  if (rewards) {
    const lastRewards = rewards[rewards.length - 1];
    rewardsThisCycle = lastRewards.data
      ? formatEther(lastRewards.data.summary.cycleTotal)
      : "0";
  }

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
        <CycleInfo />
        <BaseCard title="Total Earned">
          <Stat>
            <StatNumber>{formatNumber(parseFloat(formattedTotal))}</StatNumber>
            {toke_price ? (
              <StatHelpText>
                {formatMoney(parseFloat(formattedTotal) * toke_price)}
              </StatHelpText>
            ) : null}
          </Stat>
        </BaseCard>

        <BaseCard title="Index This Cycle">
          <Stat>
            <StatNumber>
              {formatNumber(parseFloat(rewardsThisCycle), 3)}
            </StatNumber>
            {toke_price ? (
              <StatHelpText>
                {formatMoney(parseFloat(rewardsThisCycle) * toke_price)}
              </StatHelpText>
            ) : null}
          </Stat>
        </BaseCard>
      </SimpleGrid>

      <Graph rewards={rewards.map(({ data }) => data)} />

      <Divider />

      <Box maxW="7xl" mx="auto" p={5}>
        <chakra.h1 textAlign="center" fontSize="2xl" fontWeight="bold">
          Total Earned by Token
        </chakra.h1>
      </Box>
      <Box
        maxW="7xl"
        mx="auto"
        pt={5}
        borderWidth="1px"
        borderRadius="lg"
        shadow="md"
        p="6"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Token</Th>
              <Th isNumeric>Reward (TOKE)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orderBy(Object.entries(byToken), ([_, v]) => v, "desc").map(
              ([k, v]) => (
                <Tr key={k}>
                  <Td>{k}</Td>
                  <Td isNumeric>
                    {formatNumber(Number(formatEther(v.toString())), 2)}
                  </Td>
                </Tr>
              )
            )}
          </Tbody>

          <Tfoot>
            <Tr>
              <Th>Token</Th>
              <Th isNumeric>Reward (TOKE)</Th>
            </Tr>
          </Tfoot>

          <TableCaption>
            Total TOKE Earned Across All Cycles Per Reactor
          </TableCaption>
        </Table>
      </Box>
    </>
  );
}
