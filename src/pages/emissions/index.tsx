import { Page } from "../../components/Page";
import { GetStaticProps } from "next";
import { prisma } from "../../util/db";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { orderBy } from "lodash";
import { graphColors } from "../../components/DaosGraph";
import { formatEther } from "ethers/lib/utils";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatNumber } from "../../util/maths";
import { useHiddenLabels } from "../../hooks/useHiddenLabel";

type Total = {
  cycle: number;
  description: string;
  rewards: string;
};

type Props = {
  totals: Total[];
};

export default function Leaderboard({ totals }: Props) {
  const { onClick, shouldHide } = useHiddenLabels();

  const byCycle = totals.reduce<Record<string, Record<string, number>>>(
    (acc, obj) => {
      let description = "Reactor";

      if (obj.description.includes("-")) {
        description = "LD";
      } else if (obj.description.includes("_LP")) {
        description = "LP";
      } else if (
        [
          "MIM",
          "USDC",
          "FRAX",
          "gOHM",
          "alUSD",
          "WETH",
          "LUSD",
          "FEI",
          "DAI",
        ].includes(obj.description)
      ) {
        description = "Pair Reactor";
      }

      let previousCycle = acc[obj.cycle];

      return {
        ...acc,
        [obj.cycle]: {
          ...previousCycle,
          [description]:
            parseFloat(formatEther(obj.rewards)) +
            (previousCycle?.[description] || 0),
        },
      };
    },
    {}
  );
  const data = Object.entries(byCycle).map(([k, v]) => ({ cycle: k, ...v }));

  const orderedEmissions = orderBy(
    Object.entries(data[data.length - 1])
      .map(([name, total]) => ({
        name,
        total,
      }))
      .filter(({ name }) => name !== "cycle"),
    "total",
    "desc"
  );

  let yformatter = Intl.NumberFormat("en", { notation: "compact" });

  return (
    <Page header="Reward Emissions">
      <div style={{ width: "100%", height: "500px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 0,
              right: 75,
              left: 75,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="cycle"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={Array.from(
                { length: Object.keys(byCycle).length / 2 },
                (v, i) => i * 2 + 201
              )}
            />
            <YAxis tickFormatter={(tick) => yformatter.format(tick)}>
              <Label
                style={{ fill: "ghostwhite" }}
                value="Toke"
                angle={-90}
                offset={10}
                position="left"
              />
            </YAxis>
            <Tooltip
              labelStyle={{ color: "black" }}
              labelFormatter={(label, payload: Payload<number, string>[]) => {
                const total = payload
                  .map((obj) => obj.value || 0)
                  .reduce((a, b) => a + b, 0);
                return `Cycle ${label} (${formatNumber(total, 2)})`;
              }}
              formatter={(amount: number) => formatNumber(amount, 2)}
            />
            <Legend onClick={onClick} />
            {orderedEmissions.map(({ name }, i) => (
              <Area
                hide={shouldHide(name)}
                key={name}
                dataKey={name}
                type="stepAfter"
                stackId="1"
                fill={graphColors[i % graphColors.length]}
                stroke={graphColors[i % graphColors.length]}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const totals = await prisma.$queryRaw<Total[]>`
      select cycle, description, sum(amount)::varchar as rewards
      from (select address,
                   cycle,
                   data -> 'summary' -> 'breakdown' as breakdown
            from ipfs_rewards) totals,
           jsonb_to_recordset(totals.breakdown) as breakdown(amount decimal, description varchar)
      group by cycle, description
      order by rewards
  `;

  return {
    props: {
      totals,
    },
  };
};
