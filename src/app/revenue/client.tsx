"use client";
import { orderBy } from "lodash";
import { Formatter } from "components/Formatter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTerminal } from "@fortawesome/free-solid-svg-icons";
import { Coin } from "components/coin";
import { formatISO, isAfter, isBefore, sub } from "date-fns";
import { useState } from "react";
import { StatCard } from "components/StatCard";
import { Card } from "components/Card";
import { CycleRevenue } from "components/CycleRevenue";
import type { Value, TransactionExtended } from "@/app/revenue/page";

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

export function RevenueClient({ values, cycleTimes }: Props) {
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
    values.flatMap(({ transactions }) => transactions),
    "timestamp",
    "desc"
  );

  const filteredTransactions = orderBy(
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

    groupedTotals[i + 201] = filteredTransactions.filter(
      ({ timestamp }) =>
        isAfter(timestamp, start) && isBefore(timestamp, nextCycle)
    );
  }

  return (
    <>
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
    </>
  );
}
