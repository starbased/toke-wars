import { GetStaticProps } from "next";
import { prisma } from "../../util/db";
import { Page } from "../../components/Page";
import { toBuffer } from "../api/updateEvents";
import { useTokePrice } from "../../util/api/tokemak";
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
import { formatEther } from "ethers/lib/utils";
import { CycleInfo } from "../../components/CycleInfo";
import { BaseCard } from "../../components/DaoDetailsCard";
import { formatMoney, formatNumber } from "../../util/maths";
import { Graph } from "../../components/Graph";
import orderBy from "lodash/orderBy";
import { UserInput } from "../../components/UserInput";

export type IpfsRewardsRecord = {
  cycle: number;
  data: { amount: string; description: string }[];
  cycleTotal: string;
  amount: string;
};

type Props = {
  rewards: IpfsRewardsRecord[];
  latest_cycle: number;
};

export default function Index({ rewards: known_rewards, latest_cycle }: Props) {
  const toke_price = useTokePrice();

  const loading = !known_rewards;

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

  const rewards = Array.from(Array(latest_cycle + 1)).map((_, i) => {
    let rewards = known_rewards.find(({ cycle }) => cycle === i);

    if (rewards?.cycle === 0) {
      rewards.data = [
        {
          description: "DeGenesis",
          amount: rewards.amount.toString(),
        },
      ];
    }

    return (
      rewards || {
        amount: "0",
        data: [],
        cycleTotal: "0",
        cycle: i,
      }
    );
  });

  const total = rewards
    .map((data) => data.cycleTotal.toString())
    .reduce<string | bigint>((a, b = "0") => BigInt(a) + BigInt(b), "0");

  const byToken: { [k: string]: bigint } = {};

  for (let data of rewards) {
    const breakdowns = data.data;
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
    rewardsThisCycle = lastRewards ? formatEther(lastRewards.cycleTotal) : "0";
  }

  return (
    <Page header="Rewards">
      <UserInput />
      <>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
          <CycleInfo />
          <BaseCard title="Total Earned">
            <Stat>
              <StatNumber>
                {formatNumber(parseFloat(formattedTotal))}
              </StatNumber>
              {toke_price ? (
                <StatHelpText>
                  {formatMoney(parseFloat(formattedTotal) * toke_price)}
                </StatHelpText>
              ) : null}
            </Stat>
          </BaseCard>

          <BaseCard title="Rewards This Cycle">
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

        <Graph rewards={rewards} />

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
    </Page>
  );
}

export const getServerSideProps: GetStaticProps<
  Props,
  { address: string }
> = async ({ params }) => {
  let address = params?.address!;
  address = address.toLowerCase();

  const latest_cycle = (
    await prisma.$queryRaw<
      { max: number }[]
    >`select max(cycle) from ipfs_rewards`
  )[0].max;

  const rewards = await prisma.ipfsReward.findMany({
    where: { address: toBuffer(address) },
    select: { data: true, cycle: true, amount: true, cycleTotal: true },
  });

  return {
    props: {
      rewards: rewards.map((reward) => ({
        cycle: reward.cycle,
        data: reward.data as { amount: string; description: string }[],
        amount: reward.amount.toString(),
        cycleTotal: reward.cycleTotal.toFixed(),
      })),
      latest_cycle,
    },
  };
};
