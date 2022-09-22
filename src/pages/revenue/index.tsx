import { orderBy } from "lodash";
import { Page } from "components/Page";
import { ERC20__factory, ManagerContract__factory } from "@/typechain";
import { Formatter } from "components/Formatter";
import { GetStaticProps } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTerminal } from "@fortawesome/free-solid-svg-icons";
import { getBlocks, getProvider } from "@/utils";
import { getGeckoData } from "utils/api/coinGecko";
import { BigNumber } from "bignumber.js";
import { Coin } from "components/coin";
import { formatISO, isAfter, isBefore, sub } from "date-fns";
import { useState } from "react";
import { StatCard } from "components/StatCard";
import { Card } from "components/Card";
import Head from "next/head";
import { CycleRevenue } from "components/CycleRevenue";
import { TOKEMAK_MANAGER } from "@/constants";

type RevenueTransaction = {
  transactionHash: string;
  blockNumber: number;
  value: string;
  timestamp: number;
};

export type RevenueTransactionExtended = {
  amount: number;
  usdValue: number;
  coin: string;
} & RevenueTransaction;

type Value = {
  coin: string;
  transactions: RevenueTransaction[];
  price: number;
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
    isAfter(lastWeek, new Date(obj.timestamp))
  );

  return data
    .slice(0, index)
    .map((obj) => obj.usdValue)
    .reduce((a, b) => a + b, 0);
}

export default function Revenue({ values, cycleTimes }: Props) {
  const [totalDuration, setTotalDuration] = useState<Duration | null>(null);

  let totals = values
    .map(({ coin, transactions, price }) => {
      let filteredTransactions = transactions;

      if (totalDuration) {
        filteredTransactions = filteredTransactions.filter(({ timestamp }) =>
          isBefore(sub(new Date(), totalDuration), new Date(timestamp))
        );
      }

      const amount = filteredTransactions
        .map(({ value }) => new BigNumber(value))
        .reduce((a, b) => a.plus(b), new BigNumber(0))
        .div(10 ** 18);

      return {
        coin,
        amount,
        usdValue: amount.times(price).toNumber(),
      };
    })
    .filter(({ usdValue }) => usdValue > 0);

  totals = orderBy(totals, "usdValue", "desc");

  const data = orderBy(
    values.flatMap(({ coin, transactions, price }) =>
      transactions.map((tx) => {
        const amount = new BigNumber(tx.value).div(10 ** 18);
        return {
          ...tx,
          amount: amount.toNumber(),
          usdValue: amount.times(price).toNumber(),
          coin,
        };
      })
    ),
    "blockNumber",
    "desc"
  );

  let filteredData = data;

  if (totalDuration) {
    filteredData = filteredData.filter(({ timestamp }) =>
      isBefore(sub(new Date(), totalDuration), new Date(timestamp))
    );
  }

  const groupedTotals = {} as Record<number, RevenueTransactionExtended[]>;
  for (let i = 0; i < cycleTimes.length; i++) {
    const start = cycleTimes[i];
    const nextCycle = cycleTimes[i + 1] || new Date();

    groupedTotals[i + 201] = filteredData.filter(
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
            {totals?.map(({ coin, amount, usdValue }) => (
              <tr key={coin}>
                <td>
                  <Coin coin={coin}>{coin}</Coin>
                </td>
                <td>
                  <Formatter
                    value={amount.toNumber()}
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
  const tokens = {
    "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b": {
      name: "CVX",
      gecko_id: "convex-finance",
    },
    "0xd533a949740bb3306d119cc777fa900ba034cd52": {
      name: "CRV",
      gecko_id: "curve-dao-token",
    },
    "0x6c3f90f043a72fa612cbac8115ee7e52bde6e490": {
      name: "3CRV",
      gecko_id: "lp-3pool-curve",
    },
    "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32": {
      name: "LDO",
      gecko_id: "lido-dao",
    },
    "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7": {
      name: "cvxCRV",
      gecko_id: "convex-crv",
    },
    "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF": {
      name: "ALCX",
      gecko_id: "alchemix",
    },
    "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2": {
      name: "SUSHI",
      gecko_id: "sushi",
    },
    "0x4104b135dbc9609fc1a9490e61369036497660c8": {
      name: "APW",
      gecko_id: "apwine",
    },
  };

  const provider = getProvider();

  let values: Value[] = [];

  const excludedTransactions = [
    "0xf125f3f952d721930fd9289fbe458c4c595a83863917a2edd59f9cf22d196e1e",
    "0x3f342f0612b8f1d1ad24ed0d0bdfe84c3fe67699d78fa681b06c96673596db91",
    "0x10e8b9cd6db6eb2b7f80930f39a6049e07ee1dac26ca4ce8d53c678c3f92c293",
    "0x586ca0b67b79a2a0cb8bfbf818fefd737ec3e104d342526e2455054758af0eb9",
    "0x210a91b4c203b8a437a2dac17354be02f4462122e65c57d7147197e000ea5e02",
    "0x787a355752dedb75f296c494a68d7d21e4e7294176957178682e9c750a703523",
    "0xdd39d1bc78706d20a2ac84c236b129a59ca53247e951aa1baf2c16999c4b5eba",
    "0x434ca35257385af8b9089a36e96862fa9409ae54874b5e17b4caba54f9a3ad36",
    "0x652297c3a60693c3c5948e5c920dfaa8671c1dc02be4ff3158f04a93a2bf4194",
    "0xdfb01dab686d7121eb5440ca81c41163b325ef55de54c2c80b4aa94c37bd91ef",
    "0xeb9a9326eab51172b57a7e12945e880e1703a06793060b69f668e7e1463a5784",
    "0x28fcfaf89634f8c3f51e08bd353320fcc5f46d56bf4e092ed6bd3b1fa88dc332",
  ];

  for (let [tokenContract, { gecko_id, name }] of Object.entries(tokens)) {
    const contract = ERC20__factory.connect(tokenContract, provider);

    const transactions = (
      await contract.queryFilter(
        contract.filters.Transfer(
          null,
          "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B"
        ),
        14489954
      )
    )
      .filter(
        (transaction) =>
          !excludedTransactions.includes(transaction.transactionHash)
      )
      .map(({ transactionHash, blockNumber, args: { value } }) => {
        let adjustedValue;

        if (
          transactionHash ===
            "0xd922cbd281af2fd6a167fd336454e94573216f36e2a86610a06f4cf3fbe0ac19" &&
          tokenContract === "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF"
        ) {
          adjustedValue = "294951379654954300000";
        }
        return {
          transactionHash,
          blockNumber,
          value: adjustedValue || value.toString(),
        };
      });

    const timestamps = (
      await getBlocks(transactions.map((obj) => obj.blockNumber))
    ).reduce<Record<number, Date>>(
      (acc, obj) => ({ ...acc, [obj.number]: obj.timestamp }),
      {}
    );

    const gecko_data = await getGeckoData(gecko_id);

    values.push({
      coin: name,
      transactions: transactions.map((obj) => ({
        ...obj,
        timestamp: timestamps[obj.blockNumber].getTime(),
      })),
      price: gecko_data.market_data.current_price.usd,
    });
  }

  const contract = ManagerContract__factory.connect(TOKEMAK_MANAGER, provider);

  const cycles = await contract.queryFilter(
    contract.filters.CycleRolloverStarted(),
    13088665
  );

  const toNumber = (obj: { args: any[] }) => obj.args[0].toNumber() * 1000;

  const cycleTimes = cycles.map(toNumber);

  return {
    props: { values, cycleTimes: [...cycleTimes] },
    revalidate: 60 * 5,
  };
};
