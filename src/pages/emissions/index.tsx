import { Page } from "components/Page";
import { GetStaticProps } from "next";
import { prisma } from "utils/db";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";

import { orderBy } from "lodash";
import { graphColors } from "components/DaosGraph";
import { formatEther } from "ethers/lib/utils";
import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { formatNumber } from "utils/maths";
import { useHiddenLabels } from "hooks/useHiddenLabel";
import { getHistoricalPrice } from "utils/api/coinGecko";
import { addDays } from "date-fns";

import { useTokePrice } from "utils/api/tokemak";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Divider } from "components/Divider";
import Head from "next/head";

type Metric = {
  cycle: number;
  mean: number;
  median: number;
  max: number;
  standard_deviation: number;
  count: number;
};

type Total = {
  cycle: number;
  description: string;
  rewards: string;
};

type Props = {
  data: { cycle: number; total: number; usdValue: number }[];
  metrics: Metric[];
};

export default function Leaderboard({ data, metrics }: Props) {
  const price = useTokePrice();
  const lastRecord = data[data.length - 1];

  if (price !== 0) {
    lastRecord.usdValue = lastRecord.total * price;
  }

  const { onClick, shouldHide } = useHiddenLabels();

  const orderedEmissions = orderBy(
    Object.entries(lastRecord)
      .filter(([name]) => !["total", "usdValue"].includes(name))
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
    <Page header="Reward Emissions" className="items-center">
      <Head>
        <title>Rewards Emissions</title>
        <meta
          name="description"
          content="See how Tokemak reward emissions are changing over time."
        />
      </Head>
      <div style={{ width: "100%", height: "500px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="cycle"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={Array.from(
                { length: data.length / 2 },
                (v, i) => i * 2 + 201
              )}
            />
            <YAxis
              tickFormatter={(tick) => yformatter.format(tick)}
              yAxisId="right"
              orientation="right"
            >
              <Label
                style={{ fill: "ghostwhite" }}
                value="Toke"
                angle={-90}
                offset={10}
                position="right"
              />
            </YAxis>
            <YAxis
              tickFormatter={(tick) => yformatter.format(tick)}
              unit="$"
              yAxisId="left"
              orientation="left"
            ></YAxis>

            <Tooltip
              labelStyle={{ color: "black" }}
              labelFormatter={(label, payload: Payload<number, string>[]) => {
                return `Cycle ${label} (${formatNumber(
                  payload[0]?.payload?.total,
                  2
                )})`;
              }}
              formatter={(amount: number) => formatNumber(amount, 2)}
            />
            <Legend onClick={onClick} />
            {orderedEmissions.map(({ name }, i) => (
              <Area
                hide={shouldHide(name)}
                key={name}
                dataKey={name}
                stackId="1"
                fill={graphColors[i % graphColors.length]}
                stroke={graphColors[i % graphColors.length]}
                yAxisId="right"
              />
            ))}

            <Line
              connectNulls={true}
              dataKey="usdValue"
              name="USD Value"
              stroke="#8884d8"
              yAxisId="left"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ alignSelf: "flex-end", color: "gray" }}>
        Price data from{" "}
        <a href="https://www.coingecko.com" target="_blank" rel="noreferrer">
          CoinGecko
        </a>
      </div>

      <div>
        <p>
          This displays information about toke rewards that can be claimed each
          cycle, not the amount that has been claimed.
        </p>
        <p>
          Data is pulled from ipfs. Read more about how rewards work in the{" "}
          <a
            href="https://docs.tokemak.xyz/toke/liquidity-direction/claiming-rewards-from-contract"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            tokemak docs <FontAwesomeIcon icon={faExternalLink} />
          </a>
        </p>
        <p style={{ marginTop: "15px" }}>
          USD Value is calculated taking the total for a cycle and multiplying
          it by the price of toke on the day of the cycle.
        </p>
        <p>
          For cycles that have not ended yet the last known price data is used.
        </p>
      </div>

      <Divider />

      <div className="overflow-x-auto w-full md:w-auto">
        <h2 className="self-center text-2xl">Stats</h2>

        <table className="styledTable">
          <thead>
            <tr>
              <th>Cycle</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Max</th>
              <th>Standard Deviation</th>
              <th>Wallets</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={metric.cycle}>
                <td>{metric.cycle}</td>
                <td>{formatNumber(metric.mean, 2)}</td>
                <td>{formatNumber(metric.median, 2)}</td>
                <td>{formatNumber(metric.max, 2)}</td>
                <td>{formatNumber(metric.standard_deviation, 2)}</td>
                <td>{metric.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const totals = await prisma.$queryRaw<Total[]>`
      select cycle, description, sum(amount)::varchar as rewards
      from (select address,
                   cycle,
                   data as breakdown
            from ipfs_rewards
            where cycle > 200) totals,
           json_to_recordset(totals.breakdown) as breakdown(amount decimal, description varchar)
      group by cycle, description
      order by rewards
  `;

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

      let modifiedCycle = obj.cycle;

      if (obj.cycle < 201) {
        modifiedCycle = Math.floor((modifiedCycle - 5) / 7) * 7 + 5;
      }
      let previousCycle = acc[modifiedCycle];

      return {
        ...acc,
        [modifiedCycle]: {
          ...previousCycle,
          [description]:
            parseFloat(formatEther(obj.rewards)) +
            (previousCycle?.[description] || 0),
        },
      };
    },
    {}
  );

  const cycle_201_time = 1645635600;

  const startDate = new Date(cycle_201_time * 1000);

  const historicalPrices = await getHistoricalPrice("tokemak", cycle_201_time);
  let days = Object.keys(historicalPrices);

  const data = Object.entries(byCycle).map(([cycle, v], i) => {
    const total = Object.values(v).reduce((a, b) => a + b, 0);
    const date = addDays(startDate, (i + 1) * 7);

    const priceOnDay =
      historicalPrices[
        days.find((s) => date.getTime() < parseInt(s)) || days[days.length - 1]
      ];

    let usdValue = total * priceOnDay;

    return {
      cycle: parseInt(cycle),
      total,
      usdValue,
      ...v,
    };
  });

  const metrics = await prisma.$queryRaw<Metric[]>`
      select cycle,
             avg(amount)                                         as mean,
             PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS median,
             MAX(amount)                                         AS max,
             STDDEV(amount)                                      AS standard_deviation,
             count(*)::integer                                   as count
      from (select cycle, cycle_total / 10 ^ 18 as amount
            from ipfs_rewards
            where cycle > 200) cycles
      group by cycle
      order by cycle desc
  `;

  return {
    props: {
      data,
      metrics,
    },
  };
};
