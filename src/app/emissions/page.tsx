import { Page } from "@/components/Page";
import { prisma } from "utils/db";
import { Metrics } from "./metrics";
import { Graph } from "./graph";
import { getHistoricalPriceRaw } from "utils/api/coinGecko";
import { addDays } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Divider } from "components/Divider";

export default async function Emissions() {
  const totals = await getTotals();

  return (
    <Page header="Reward Emissions" className="items-center">
      <div style={{ width: "100%", height: "500px" }}>
        <Graph totals={totals} />
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

      {/* @ts-expect-error Server Component */}
      <Metrics />
    </Page>
  );
}

type Total = {
  cycle: number;
  description: string;
  rewards: string;
};

export async function getTotals() {
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
      const previousCycle = acc[modifiedCycle];

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

  const historicalPrices = await getHistoricalPriceRaw(
    "tokemak",
    cycle_201_time
  );

  return Object.entries(byCycle).map(([cycle, values], i) => {
    const total = Object.values(values).reduce((a, b) => a + b, 0);
    const date = addDays(startDate, (i + 1) * 7).getTime();

    const priceOnDay =
      historicalPrices.find(([time]) => time >= date)?.[1] || 0;

    const usdValue = total * priceOnDay;

    return {
      cycle: parseInt(cycle),
      total,
      usdValue,
      ...values,
    };
  });
}
