import { providers } from "ethers";
import { prisma } from "./db";
import { Block } from "@prisma/client";
import { chunk, isEmpty } from "lodash";

export function addressToHex(buffer: Buffer) {
  return "0x" + buffer.toString("hex");
}

export function getProvider() {
  return new providers.InfuraProvider(1, process.env.NEXT_PUBLIC_INFURA_KEY);
}

export async function updateDbBlocks() {
  const numbers = await prisma.$queryRaw<{ block_number: number }[]>`
      select distinct block_number
      from (select block_number
            from dao_transactions_v
            inner join dao_addresses da on dao_transactions_v.account = da.address
            union all 
            select "blockNumber"
            from erc20_transfers
            inner join reactors on reactors.address = erc20_transfers.address
            ) b
      where not exists(select 1 from blocks where number = block_number)
order by block_number
  `;
  const provider = getProvider();
  // if running a local node this will speed up block imports
  // const provider = new providers.StaticJsonRpcProvider();

  let toSave: Block[] = [];

  for (let number_chunk of chunk(
    numbers.map(({ block_number }) => block_number),
    4
  )) {
    const numbers = await Promise.all(
      number_chunk.map((number) => provider.getBlock(number))
    );
    console.log(`adding blocks ${number_chunk}`);
    await prisma.block.createMany({
      data: numbers.map((block) => ({
        number: block.number,
        timestamp: new Date(block.timestamp * 1000),
      })),
    });
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
