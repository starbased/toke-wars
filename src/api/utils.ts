import { provider } from "../util/providers";

import untypedBlocks from "../cache/blocks.json";
import { BigNumber } from "ethers";
import { addDays, set } from "date-fns";

const blocksCache: Record<string, number> = untypedBlocks;

(window as any).blocks = blocksCache;
export async function getBlockNumber(blockHash: string) {
  const cache = (window as any).blocks[blockHash];
  if (cache) {
    return cache;
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
  const output = (await provider.getBlock(blockHash)).timestamp;
  console.debug("date cache miss", new Date(output * 1000));
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
