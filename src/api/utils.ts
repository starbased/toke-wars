import { provider } from "../util/providers";

import { BigNumber } from "ethers";
import { parseISO } from "date-fns";

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

const currentBlockP = provider
  .getBlockNumber()
  .then((block) => provider.getBlock(block));

export async function estimateTime(
  block: number,
  startBlock = 13331168,
  startTime = parseISO("2021-10-01T04:00:00.000Z")
) {
  const currentBlock = await currentBlockP;

  const totalBlocks = startBlock - currentBlock.number;

  const totalMs = startTime.getTime() - currentBlock.timestamp * 1000;

  const msPerBlock = totalMs / totalBlocks;
  const blocksFromStart = block - startBlock;

  return new Date(
    Math.floor(blocksFromStart * msPerBlock) + startTime.getTime()
  );
}
