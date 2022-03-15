import { BigNumber } from "ethers";
import { useQueries } from "react-query";
import { formatEther } from "ethers/lib/utils";
import { getCycleHash, getCycleInfo } from "./Rewards";
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
import { formatNumber, formatMoney } from "../../util/maths";
import { BaseCard } from "../DaoDetailsCard";
import { Graph } from "./Graph";
import { useTokePrice } from "../../api/coinGecko";

type Props = {
  latestCycle: BigNumber;
  address: string;
};

export function Totals({ latestCycle, address }: Props) {
  const { data: toke_price } = useTokePrice();
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
    return (
      <div>
        <Stack>
          <chakra.h2>Waiting for Cycle Rewards</chakra.h2>
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
  // const { data: toke_price } = useTokenPrice("tokemak");

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, lg: 8 }}>
        <BaseCard title="Current Cycle">
          <Stat>
            <StatNumber>{latestCycle.toNumber()}</StatNumber>
            {/* calc days until next cycle */}
            <StatHelpText>Next Cycle in X Days</StatHelpText>
          </Stat>
        </BaseCard>
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
