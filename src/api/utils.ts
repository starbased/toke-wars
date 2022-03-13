import { provider } from "../util/providers";

import untypedBlocks from "../cache/blocks.json";
import { BigNumber } from "ethers";
import { addDays, getUnixTime, set } from "date-fns";
import axios from "axios";
import { useQuery } from "react-query";

const blocksCache: Record<string, number> = untypedBlocks;

(window as any).blocks = blocksCache;
export async function getBlockNumber(blockHash: string) {
  const cache = (window as any).blocks[blockHash];
  if (cache) {
    return cache;
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
  const output = (await provider.getBlock(blockHash)).timestamp;
  console.log("miss", new Date(output * 1000));
  (window as any).blocks = { ...(window as any).blocks, [blockHash]: output };
  return output;
}

export function runningTotal<T>(
  events: Iterable<T>,
  getValue: (t: T) => (n: BigNumber) => BigNumber
) {
  const output: (T & { total: BigNumber })[] = [];

  let total = BigNumber.from(0);

  for (let event of events) {
    total = getValue(event)(total);

    output.push({
      total: total,
      ...event,
    });
  }

  return output;
}

export function estimateDay(block: number, morningBlock = 14369954) {
  const days = Math.floor((morningBlock - block) / 6461.5);
  const today = set(new Date(), {
    milliseconds: 0,
    seconds: 0,
    minutes: 0,
    hours: 0,
  });

  return addDays(today, -days);
}

export async function getTokenPrice(coin?: string) {
  const { data } = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price`,
    { params: { ids: coin, vs_currencies: "usd" } }
  );
  return data;
}

export function useHistoricalPrice(coin?: string) {
  return useQuery(
    ["price", coin],
    async () => {
      const { data } = await axios.get<{ prices: [number, number][] }>(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range`,
        {
          params: {
            vs_currency: "usd",
            //has to be at least 90 days to get in a daily scale
            //TODO: make sure to go back far enough fetch transactions first
            from: getUnixTime(addDays(new Date(), -91)),
            to: getUnixTime(new Date()),
          },
        }
      );
      return data;
    },
    {
      enabled: !!coin,
      select(data) {
        return data.prices.reduce<Record<number, number>>(
          (acc, [time, price]) => ({ ...acc, [time]: price }),
          {}
        );
      },
    }
  );
}
