import { providers } from "ethers";
import { prisma } from "./db";
import { Block } from "@prisma/client";

export function getProvider() {
  return new providers.InfuraProvider(1, "c226490be8074be596c1106d790aa6a3");
}

export async function getBlocks(numbers: number[]) {
  const provider = getProvider();

  //dedup
  numbers = Array.from(new Set(numbers));

  const known = await prisma.block.findMany({
    where: { number: { in: numbers } },
  });

  const knownSet = new Set(known.map((obj) => obj.number));

  const needed = numbers.filter((number) => !knownSet.has(number));

  let toSave: Block[] = [];
  for (let number of needed) {
    const block = await provider.getBlock(number);
    toSave.push({ number, timestamp: new Date(block.timestamp * 1000) });
  }

  await prisma.block.createMany({ data: toSave });

  return [...known, ...toSave];
}
