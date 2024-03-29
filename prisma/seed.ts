import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import blocks from "./postgres_public_blocks.json";
import daos from "./postgres_public_daos.json";
import dao_addresses from "./postgres_public_dao_addresses.json";
import reactors from "./postgres_public_reactors.json";
import fs from "fs";
import { arrayify } from "ethers/lib/utils";

export function toBuffer(hexString: string) {
  return Buffer.from(arrayify(hexString));
}

async function main() {
  await prisma.block.createMany({
    // @ts-ignore
    data: blocks.map((obj) => ({ ...obj, timestamp: new Date(obj.timestamp) })),
  });

  await prisma.dao.createMany({
    data: daos,
  });

  await prisma.daoAddress.createMany({
    data: dao_addresses.map((dao) => ({
      ...dao,
      address: toBuffer(dao.address),
    })),
  });

  await prisma.reactor.createMany({
    data: reactors.map((reactor) => ({
      ...reactor,
      address: toBuffer(reactor.address),
    })),
  });

  await prisma.$executeRawUnsafe(
    fs.readFileSync("./prisma/views.sql").toString()
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
