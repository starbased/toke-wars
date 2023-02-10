import { providers } from "ethers";
import { prisma } from "./db";
import { Block } from "@prisma/client";
import { chunk } from "lodash";
import { arrayify } from "ethers/lib/utils";
import { ManagerContract__factory } from "@/typechain";
import { TOKEMAK_MANAGER } from "@/constants";

export function addressToHex(buffer: Buffer) {
  return "0x" + buffer.toString("hex");
}

export function toBuffer(hexString: string) {
  return Buffer.from(arrayify(hexString));
}

export function getAllReactors() {
  const managerContract = ManagerContract__factory.connect(
    TOKEMAK_MANAGER,
    getProvider()
  );

  return managerContract.getPools();
}

export function getProvider() {
  return new providers.InfuraProvider(1, process.env.NEXT_PUBLIC_INFURA_KEY);
}

export async function updateDbBlocks() {
  const numbers = await prisma.$queryRaw<{ block_number: number }[]>`
      select distinct block_number 
      from events
        left outer join blocks on events.block_number = number
      where number is null
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
