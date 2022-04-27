import { prisma } from "../src/util/db";
import blocks from "./postgres_public_blocks.json";
import daos from "./postgres_public_daos.json";
import dao_addresses from "./postgres_public_dao_addresses.json";
import reactors from "./postgres_public_reactors.json";

async function main() {
  await prisma.block.createMany({
    data: blocks.map((obj) => ({ ...obj, timestamp: new Date(obj.timestamp) })),
  });

  await prisma.dao.createMany({
    data: daos,
  });

  await prisma.daoAddress.createMany({
    data: dao_addresses,
  });

  await prisma.reactor.createMany({
    data: reactors,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
