import { orderBy } from "lodash";
import { Page } from "components/Page";
import { ManagerContract__factory } from "@/typechain";
import { Formatter } from "components/Formatter";
import { GetStaticProps } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTerminal } from "@fortawesome/free-solid-svg-icons";
import { getProvider } from "@/utils";
import { getGeckoData } from "utils/api/coinGecko";
import { Coin } from "components/coin";
import { formatISO, isAfter, isBefore, sub } from "date-fns";
import { useState } from "react";
import { StatCard } from "components/StatCard";
import { Card } from "components/Card";
import Head from "next/head";
import { CycleRevenue } from "components/CycleRevenue";
import { TOKEMAK_MANAGER } from "@/constants";
import { prisma } from "utils/db";

type Transaction = {
  transactionHash: string;
  value: number;
  timestamp: number;
  logIndex: number;
};

export type TransactionExtended = Transaction & {
  usdValue: number;
};

type Value = {
  coin: string;
  transactions: TransactionExtended[];
};

type Props = {
  values: Value[];
  cycleTimes: number[];
};

function usdValueOverRange(
  data: { timestamp: number; usdValue: number }[],
  duration: Duration
) {
  const lastWeek = sub(new Date(), duration);

  const index = data.findIndex((obj) =>
    isAfter(lastWeek, new Date(obj.timestamp * 1000))
  );

  return data
    .slice(0, index)
    .map((obj) => obj.usdValue)
    .reduce((a, b) => a + b, 0);
}

export default function Revenue({ values, cycleTimes }: Props) {
  const [totalDuration, setTotalDuration] = useState<Duration | null>(null);

  let filteredValues = values;

  if (totalDuration) {
    filteredValues = filteredValues
      .map((value) => ({
        ...value,
        transactions: value.transactions.filter(({ timestamp }) =>
          isBefore(sub(new Date(), totalDuration), new Date(timestamp * 1000))
        ),
      }))
      .filter((value) => value.transactions.length > 0);
  }

  let totals = filteredValues
    .map(({ coin, transactions }) => {
      const value = transactions.reduce((acc, obj) => obj.value + acc, 0);
      const usdValue = transactions.reduce((acc, obj) => obj.usdValue + acc, 0);

      return {
        coin,
        value,
        usdValue,
      };
    })
    .filter(({ usdValue }) => usdValue > 0);

  totals = orderBy(totals, "usdValue", "desc");

  const data = orderBy(
    filteredValues.flatMap(({ coin, transactions }) =>
      transactions.map((tx) => {
        return {
          ...tx,
          coin,
        };
      })
    ),
    "timestamp",
    "desc"
  );

  const groupedTotals = {} as Record<
    number,
    (TransactionExtended & { coin: string })[]
  >;
  for (let i = 0; i < cycleTimes.length; i++) {
    const start = cycleTimes[i];
    const nextCycle = cycleTimes[i + 1] || new Date();

    groupedTotals[i + 201] = data.filter(
      ({ timestamp }) =>
        isAfter(timestamp, start) && isBefore(timestamp, nextCycle)
    );
  }

  return (
    <Page header="Protocol Revenue" className="items-center">
      <Head>
        <title>Protocol Revenue</title>
        <meta
          name="description"
          content="Find out how much Protocol Revenue Tokemak is bringing in"
        />
      </Head>
      <div className="grid md:grid-cols-3 w-full">
        <StatCard
          className="cursor-pointer"
          onClick={() => setTotalDuration({ weeks: 1 })}
          top="Total Weekly Revenue"
          middle={
            <Formatter currency value={usdValueOverRange(data, { weeks: 1 })} />
          }
        />

        <StatCard
          className="cursor-pointer"
          onClick={() => setTotalDuration({ months: 1 })}
          top="Total Monthly Revenue"
          middle={
            <Formatter
              currency
              value={usdValueOverRange(data, { months: 1 })}
            />
          }
        />

        <StatCard
          className="cursor-pointer"
          onClick={() => setTotalDuration(null)}
          top="Estimated Yearly Revenue (last month x 12)"
          middle={
            <Formatter
              currency
              value={usdValueOverRange(data, { months: 1 }) * 12}
            />
          }
        />
      </div>

      <Card>
        <h2 className="text-center text-xl">
          Totals
          {totalDuration ? (
            <>
              {" "}
              since{" "}
              {formatISO(sub(new Date(), totalDuration), {
                representation: "date",
              })}{" "}
              <button
                title="clear"
                onClick={() => setTotalDuration(null)}
                className="p-1 bg-gray-500 rounded-md"
              >
                X
              </button>
            </>
          ) : (
            ""
          )}
        </h2>

        <table className="styledTable">
          <thead>
            <tr>
              <th>Coin</th>
              <th>Amount</th>
              <th>Current USD Value</th>
            </tr>
          </thead>
          <tbody>
            {totals?.map(({ coin, value, usdValue }) => (
              <tr key={coin}>
                <td>
                  <Coin coin={coin}>{coin}</Coin>
                </td>
                <td>
                  <Formatter
                    value={value}
                    options={{
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }}
                  />
                </td>
                <td>
                  <Formatter currency value={usdValue} />
                </td>
              </tr>
            ))}
            <tr>
              <td>Total</td>
              <td>
                {/* no point in summing token quantities since they are not comparable */}
              </td>
              <td>
                <Formatter
                  currency
                  value={totals
                    .map((obj) => obj.usdValue)
                    .reduce<number>((a, b) => a + b, 0)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://tokenterminal.com/terminal/projects/tokemak"
        >
          <button>
            <FontAwesomeIcon icon={faTerminal} />
            More Data via Token Terminal
          </button>
        </a>
      </Card>
      {Object.entries(groupedTotals)
        .reverse()
        .map(([cycle, events]) => (
          <CycleRevenue cycle={cycle} events={events} key={cycle} />
        ))}
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const tokens = await prisma.revenueToken.findMany({});

  const values: Value[] = [];

  for (let token of tokens) {
    const gecko_data = await getGeckoData(token.geckoId);
    const transactions = await prisma.$queryRaw<Transaction[]>`
        select ('0'||substring(erc20_transfers."transactionHash"::varchar from 2)) as "transactionHash",
               (value / 10 ^ 18)::float           as value,
               extract(epoch from timestamp)::int as timestamp,
               erc20_transfers."logIndex"
        from erc20_transfers
                 inner join blocks on blocks.number = erc20_transfers."blockNumber"
        left outer join revenue_ignored_transactions rit on erc20_transfers."logIndex" = rit."logIndex" and erc20_transfers."transactionHash" = rit."transactionHash"
        where rit."transactionHash" is null
          and erc20_transfers.address = ${token.address}
    `;

    values.push({
      coin: token.symbol,
      transactions: transactions.map((transactions) => ({
        ...transactions,
        usdValue: gecko_data.market_data.current_price.usd * transactions.value,
      })),
    });
  }

  return {
    props: { values, cycleTimes: await getCycleTimes() },
    revalidate: 60 * 5,
  };
};

async function getCycleTimes() {
  const contract = ManagerContract__factory.connect(
    TOKEMAK_MANAGER,
    getProvider()
  );

  const cycles = await contract.queryFilter(
    contract.filters.CycleRolloverStarted(),
    13088665
  );

  const cycleTimes = cycles.map((obj) => obj.args[0].toNumber());

  //dedup on cycle 239 the event was called twice
  return Array.from(new Set(cycleTimes));
}
