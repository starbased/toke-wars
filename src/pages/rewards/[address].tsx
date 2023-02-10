import { GetStaticProps } from "next";
import { prisma } from "utils/db";
import { Page } from "components/Page";
import { useTokePrice } from "utils/api/tokemak";
import { formatEther } from "ethers/lib/utils";
import { formatMoney, formatNumber } from "utils/maths";
import { Graph } from "components/Graph";
import orderBy from "lodash/orderBy";
import { UserInput } from "components/UserInput";
import { Divider } from "components/Divider";
import { Card } from "components/Card";
import { StatCard } from "components/StatCard";
import Head from "next/head";
import { useEffect } from "react";
import { event } from "utils/analytics";
import { useRouter } from "next/router";
import { toBuffer } from "@/utils";

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
  const router = useRouter();

  useEffect(() => {
    if (typeof router.query.address === "string") {
      event({ action: "View User Rewards", label: router.query.address });
    }
  }, [router.query]);

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
    <Page header="Rewards" className="items-center">
      <Head>
        <title>User Rewards</title>
      </Head>
      <UserInput />

      <div className="grid md:grid-cols-3">
        <StatCard top="Last Logged Cycle" middle={latest_cycle} />

        <StatCard
          top="Total Earned"
          middle={formatNumber(parseFloat(formattedTotal))}
          bottom={
            toke_price
              ? formatMoney(parseFloat(formattedTotal) * toke_price)
              : null
          }
        />

        <StatCard
          top="Rewards This Cycle"
          middle={formatNumber(parseFloat(rewardsThisCycle), 3)}
          bottom={
            toke_price
              ? formatMoney(parseFloat(rewardsThisCycle) * toke_price)
              : null
          }
        />
      </div>

      <Graph rewards={rewards} />

      <Divider />

      <h2>Total Earned By Token</h2>
      <Card>
        <table className="styledTable">
          <thead>
            <tr>
              <th>Token</th>
              <th>Reward (TOKE)</th>
            </tr>
          </thead>
          <tbody>
            {orderBy(Object.entries(byToken), ([_, v]) => v, "desc").map(
              ([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{formatNumber(Number(formatEther(v.toString())), 2)}</td>
                </tr>
              )
            )}
          </tbody>

          <tfoot>
            <tr>
              <th>Token</th>
              <th>Reward (TOKE)</th>
            </tr>
          </tfoot>
        </table>
      </Card>
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
