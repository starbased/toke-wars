import { utils } from "ethers";
import { hexZeroPad } from "ethers/lib/utils";

import {
  addressToHex,
  getAllReactors,
  getProvider,
  toBuffer,
  updateDbBlocks,
} from "@/utils";
import { prisma } from "utils/db";

import type { NextApiRequest, NextApiResponse } from "next";
import {
  ACC_CONTRACT,
  T_TOKE_CONTRACT,
  TOKE_CONTRACT,
  TOKE_STAKING_CONTRACT,
} from "@/constants";

import type { Log } from "@ethersproject/providers";

const TRANSFER_TOPIC = utils.id("Transfer(address,address,uint256)");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const output = [];

  output.push(await updateMainContracts());
  output.push(await updateRevenue(res));
  output.push(await updateReactors(res));

  res.status(200).json(output);
}

async function updateRevenue(res: NextApiResponse) {
  const prismaQuery = await prisma.$queryRaw<[{ maximum: number }]>`
      select max(block_number) + 1 as maximum
      from events
      where topics @> array [
          '\\xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'::bytea,
          '\\x0000000000000000000000008b4334d4812C530574Bd4F2763FcD22dE94A969B'::bytea
          ]
        and topics[3] = '\\x0000000000000000000000008b4334d4812C530574Bd4F2763FcD22dE94A969B'
  `;

  const filter = {
    topics: [
      utils.id("Transfer(address,address,uint256)"),
      null,
      "0x0000000000000000000000008b4334d4812C530574Bd4F2763FcD22dE94A969B",
    ],
    fromBlock: prismaQuery[0].maximum || 1,
  };

  const output = await saveLogsToDB([filter]);
  await updateDbBlocks();

  if (output.some((obj) => obj.found > 0)) {
    await res.revalidate("/revenue");
  }

  return output;
}

async function updateReactors(res: NextApiResponse) {
  const filters = [];

  for (let address of await getAllReactors()) {
    if (address.toLowerCase() === T_TOKE_CONTRACT.toLowerCase()) {
      continue;
    }

    const fromBlock = await getMinBlock(address);
    const filter = { address, fromBlock };
    filters.push({
      ...filter,
      topics: [TRANSFER_TOPIC],
    });
  }

  const outputs = await saveLogsToDB(filters);
  await updateDbBlocks();

  for (let { found, filter } of outputs) {
    if (found === 0) {
      continue;
    }
    await res.revalidate("/reactors/" + filter.address?.toLowerCase());
  }

  return outputs;
}

async function updateMainContracts() {
  const allFilters = await Promise.all(
    [TOKE_STAKING_CONTRACT, ACC_CONTRACT].map(async (address) => ({
      address,
      fromBlock: await getMinBlock(address),
    }))
  );

  const daoAddresses = (await prisma.daoAddress.findMany()).map((obj) =>
    hexZeroPad(addressToHex(obj.address), 32)
  );

  let transferFilters: EventFilterAndBlock[] = [];
  for (let address of [TOKE_CONTRACT, T_TOKE_CONTRACT]) {
    const fromBlock = await getMinBlock(address);
    const filter = { address, fromBlock };
    transferFilters.push({
      ...filter,
      topics: [TRANSFER_TOPIC, daoAddresses],
    });
    transferFilters.push({
      ...filter,
      topics: [TRANSFER_TOPIC, null, daoAddresses],
    });
  }

  const filters: EventFilterAndBlock[] = [...allFilters, ...transferFilters];

  const outputs = await saveLogsToDB(filters);
  await updateDbBlocks();
  return outputs;
}

type EventFilterAndBlock = {
  address?: string;
  topics?: (string | null | string[])[];
  fromBlock: number;
};

async function saveLogsToDB(filters: EventFilterAndBlock[]) {
  let output: { found: number; filter: EventFilterAndBlock }[] = [];

  for (let filter of filters) {
    let fromBlock = filter.fromBlock;
    const rawLogs = await getLogs(filter, fromBlock);
    const logs = rawLogs.map(
      ({
        transactionIndex,
        removed,
        address,
        blockNumber,
        logIndex,
        transactionHash,
        topics,
        data,
      }) => ({
        blockNumber,
        logIndex,
        transactionHash: toBuffer(transactionHash),
        topics: topics.map(toBuffer),
        data: toBuffer(data),
        address: toBuffer(address),
        transactionIndex,
        removed,
      })
    );

    await prisma.event.createMany({ data: logs, skipDuplicates: true });
    output.push({ found: logs.length, filter });
  }
  return output;
}

async function getLogs(filter: EventFilterAndBlock, fromBlock = 0) {
  const provider = getProvider();

  let blockStack = [await provider.getBlockNumber()];
  let tempToBlock: number | undefined;
  const output: Log[] = [];

  while ((tempToBlock = blockStack.pop())) {
    try {
      let outputLogs = await provider.getLogs({
        ...filter,
        fromBlock,
        toBlock: tempToBlock,
      });

      output.push(...outputLogs);

      console.log(
        `found ${outputLogs.length} start ${fromBlock} end ${tempToBlock} stack ${blockStack}`
      );

      fromBlock = tempToBlock + 1;
    } catch (e) {
      // @ts-ignore
      if (e.error?.code !== -32005) {
        throw e;
      }
      blockStack.push(
        tempToBlock,
        Math.floor(fromBlock + (tempToBlock - fromBlock) / 2)
      );
      console.log("found too many");
    }
  }

  return output;
}

async function getMinBlock(address: string) {
  const fromBlock =
    (
      await prisma.event.aggregate({
        _max: { blockNumber: true },
        where: {
          address: toBuffer(address),
        },
      })
    )?._max?.blockNumber || 0;
  return fromBlock + 1;
}
