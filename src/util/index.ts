import { providers } from "ethers";
import { prisma } from "./db";
import { Block } from "@prisma/client";
import { chunk, isEmpty } from "lodash";

export function getProvider() {
  return new providers.InfuraProvider(1, process.env.NEXT_PUBLIC_INFURA_KEY);
}

export async function updateDbBlocks() {
  const numbers = await prisma.$queryRaw<{ block_number: number }[]>`
      select distinct block_number
      from (select block_number
            from reactor_values
            union all
            select block_number
            from dao_transactions) b
      where not exists(select 1 from blocks where number = block_number)
  `;
  const provider = getProvider();

  let toSave: Block[] = [];

  for (let { block_number: number } of numbers) {
    const block = await provider.getBlock(number);
    console.log("Adding new block:", number);
    toSave.push({ number, timestamp: new Date(block.timestamp * 1000) });
  }

  if (!isEmpty(toSave)) {
    await prisma.block.createMany({ data: toSave });
  }

  return toSave;
}

export async function getBlocks(rawNumbers: number[]) {
  //dedup
  const numbers = Array.from(new Set(rawNumbers));

  const output = [];
  for (let numberChunk of chunk(numbers, 100)) {
    output.push(...(await getBlocksChunk(numberChunk)));
  }

  return output;
}

async function getBlocksChunk(numbers: number[]) {
  const provider = getProvider();

  const known = await prisma.block.findMany({
    where: { number: { in: numbers } },
  });

  const knownSet = new Set(known.map((obj) => obj.number));

  const needed = numbers.filter((number) => !knownSet.has(number));

  let toSave: Block[] = [];
  for (let number of needed) {
    const block = await provider.getBlock(number);
    console.log("Adding new block:", number);
    toSave.push({ number, timestamp: new Date(block.timestamp * 1000) });
  }

  if (!isEmpty(toSave)) {
    await prisma.block.createMany({ data: toSave });
  }

  return [...known, ...toSave];
}
