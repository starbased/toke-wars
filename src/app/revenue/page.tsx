import { Page } from "components/Page";
import { ManagerContract__factory } from "@/typechain";
import { getProvider } from "@/utils";
import { getPrices } from "utils/api/coinGecko";
import { TOKEMAK_MANAGER } from "@/constants";
import { prisma } from "utils/db";
import { RevenueClient } from "@/app/revenue/client";
import type { Buffer } from "buffer";

export type Transaction = {
  transactionHash: string;
  value: number;
  timestamp: number;
  logIndex: number;
};

export type TransactionExtended = Transaction & {
  usdValue: number;
};

export type Value = {
  coin: string;
  transactions: TransactionExtended[];
};

export default async function Revenue() {
  const [values, cycleTimes] = await Promise.all([
    getValues(),
    getCycleTimes(),
  ]);

  return (
    <Page header="Protocol Revenue" className="items-center">
      <RevenueClient {...{ values, cycleTimes }} />
    </Page>
  );
}

async function getValues() {
  const tokens = await prisma.revenueToken.findMany({});

  const transactions = await prisma.$queryRaw<
    (Transaction & { address: Buffer })[]
  >`
      select ('0' || substring(erc20_transfers."transactionHash"::varchar from 2)) as "transactionHash",
             (value / 10 ^ 18)::float                                              as value,
             extract(epoch from timestamp)::int                                    as timestamp,
             erc20_transfers."logIndex",
             erc20_transfers.address
      from erc20_transfers
               inner join blocks on blocks.number = erc20_transfers."blockNumber"
               inner join revenue_tokens on revenue_tokens.address = erc20_transfers.address
               left outer join revenue_ignored_transactions rit on erc20_transfers."logIndex" = rit."logIndex" and
                                                                   erc20_transfers."transactionHash" =
                                                                   rit."transactionHash"
      where rit."transactionHash" is null
    `;

  const prices = await getPrices(tokens.map((token) => token.geckoId));

  return tokens.map((token) => ({
    coin: token.symbol,
    transactions: transactions
      .filter(({ address }) => address.compare(token.address) === 0)
      .map(({ address, ...transactions }) => ({
        ...transactions,
        usdValue: transactions.value * prices[token.geckoId].usd,
      })),
  }));
}

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
