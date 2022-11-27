import { ResourcesCard } from "./ResourcesCard";
import { prisma } from "utils/db";
import { toBuffer } from "utils/serverUtils";
import { TopHolders } from "@/app/reactors/[address]/TopHolders";
import { Graph } from "./Graph";
import { TAsset__factory } from "@/typechain";
import { addressToHex, getProvider } from "@/utils";
import { formatUnits } from "ethers/lib/utils";
import { formatNumber } from "utils/maths";
import { getHistoricalPrice } from "utils/api/coinGecko";
import { getUnixTime, isEqual, startOfDay } from "date-fns";
import { BigNumber } from "bignumber.js";
import type { Reactor } from "@prisma/client";
import { T_TOKE_CONTRACT } from "@/constants";

export type PageProps = {
  params: { address: string };
};

export default async function Reactor({ params: { address } }: PageProps) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const reactor = await getReactor(address);

  const contract = TAsset__factory.connect(address, getProvider());
  const decimal = await contract.decimals();

  const withheldLiquidity = formatUnits(
    await contract.withheldLiquidity(),
    decimal
  );

  const events = await getEvents(decimal, reactor);

  return (
    <>
      <div>
        {formatNumber(
          (parseFloat(withheldLiquidity) /
            parseInt(events[events.length - 1].total)) *
            100,
          2
        )}
        % ({formatNumber(parseFloat(withheldLiquidity), 2)}) Available for
        withdrawal
      </div>

      <div style={{ width: "100%", height: "400px" }}>
        <Graph events={events} />
      </div>
      <div style={{ alignSelf: "flex-end", color: "gray" }}>
        Price data from{" "}
        <a href="https://www.coingecko.com" target="_blank" rel="noreferrer">
          CoinGecko
        </a>
      </div>

      {/* @ts-expect-error Server Component */}
      <TopHolders {...{ address, decimal }} />
      {/* @ts-expect-error Server Component */}
      <ResourcesCard geckoId={reactor.coingeckoId} />
    </>
  );
}

export function getReactor(address: string) {
  return prisma.reactor.findUniqueOrThrow({
    where: { address: toBuffer(address) },
  });
}

export async function generateStaticParams() {
  let reactors = (
    await prisma.reactor.findMany({ select: { address: true } })
  ).map(({ address }) => addressToHex(address));

  if (process.env.FAST_BUILD) {
    return [{ address: "0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84" }];
  }
  return reactors
    .filter((address) => address !== T_TOKE_CONTRACT)
    .map((address) => ({ address: address.toLowerCase() }));
}

async function getEvents(decimal: number, reactor: Reactor) {
  const rawEvents = await prisma.$queryRaw<
    {
      timestamp: string;
      total: string;
    }[]
  >`
      select timestamp,
             round(sum(adjusted_value) over (order by block_number) / 10 ^ ${decimal}::numeric, 0)::integer as total
      from (select "transactionHash" as transaction_hash,
                   "blockNumber"     as block_number,
                   address,
                   "to"              as account,
                   value * -1        as adjusted_value
            from erc20_transfers
            union all
            select "transactionHash", "blockNumber", address, "from" as account, value
            from erc20_transfers) erc20_transfers
               inner join blocks on block_number = number
      where address = ${reactor.address}
        and account = '\\x0000000000000000000000000000000000000000'
      order by number`;

  let historicalPrices: Record<string, number> = { "1": 0 };

  if (reactor.isStablecoin) {
    historicalPrices = { "1": 1 };
  } else if (reactor.coingeckoId) {
    historicalPrices = await getHistoricalPrice(
      reactor.coingeckoId,
      getUnixTime(new Date(rawEvents[0].timestamp).getTime())
    );
  }

  let days = Object.keys(historicalPrices);

  return rawEvents
    .map(({ total, timestamp }) => {
      const date = new Date(timestamp).getTime();

      const value = new BigNumber(total)
        .times(
          historicalPrices[
            days.find((s) => date < parseInt(s)) || days[days.length - 1]
          ]
        )
        .toString();

      return {
        total,
        date,
        value,
      };
    })
    .filter(
      ({ date }, i, array) =>
        !isEqual(startOfDay(date), startOfDay(array[i + 1]?.date))
    );
}
