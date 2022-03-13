import { BigNumber } from "ethers";
import { useQueries, useQuery } from "react-query";
import { formatEther } from "ethers/lib/utils";
import React, { Suspense } from "react";
import { getCycleHash, getCycleInfo } from "./Rewards";
import orderBy from "lodash/orderBy";
import axios from "axios";
import { Formatter } from "./Formatter";
import {
  Box,
  chakra,
  Divider,
  Heading,
  SimpleGrid,
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
import { formatNumber, formatMoney } from "../util/maths";
import { BaseCard } from "./DaoDetailsCard";
import { useTokenPrice } from "../api/coinGecko";

const Graph = React.lazy(() =>
  import("./Graph").then(({ Graph }) => ({
    default: Graph,
  }))
);

type Props = {
  latestCycle: BigNumber;
  address: string;
};

export function Totals({ latestCycle, address }: Props) {
  const cycleArray = Array.from(
    Array((latestCycle?.toNumber() || -1) + 1).keys()
  );

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
    return <div>Waiting for cycle rewards</div>;
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
  const { data: toke_price } = useTokenPrice("tokemak");

  return (
    <>
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 5, lg: 8 }}
        style={{ alignSelf: "stretch" }}
        px={5}
      >
        <BaseCard title="Current Cycle">
          <Stat>
            <StatNumber>{latestCycle.toNumber()}</StatNumber>
            <StatHelpText>Next Cycle in X Days</StatHelpText>
          </Stat>
        </BaseCard>
        <BaseCard title="Total Earned">
          <Stat>
            <StatNumber>{formatNumber(parseFloat(formattedTotal))}</StatNumber>
            {toke_price ? (
              <StatHelpText>{formatMoney(1000000 * toke_price)}</StatHelpText>
            ) : null}
          </Stat>
        </BaseCard>
      </SimpleGrid>

      <div style={{ width: "100%", height: "400px" }}>
        <Suspense fallback={null}>
          <Graph rewards={rewards.map(({ data }) => data)} />
        </Suspense>
      </div>

      <Divider />

      <Box
        maxW="7xl"
        mx="auto"
        pt={5}
        px={{ base: 2, sm: 12, md: 17 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "25px",
        }}
      >
        <chakra.h1 textAlign="center" fontSize="4xl" fontWeight="bold">
          Total Earned by Token
        </chakra.h1>
      </Box>
      <Box maxW="xl" borderWidth="1px" borderRadius="lg" shadow="md" p="6">
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
                  <Td>{formatEther(v.toString())}</Td>
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
            Leaderboard tracks the DAOs with the top TOKE holdings
          </TableCaption>
        </Table>
      </Box>
    </>
  );
}
