import { BaseContract, Contract, EventFilter, Event } from "ethers";
import { arrayify } from "ethers/lib/utils";

import ERC20 from "../../abi/ERC20.json";
import TokeStaking from "../../abi/TokeStaking.json";

import { addressToHex, getProvider, updateDbBlocks } from "../../util";
import { prisma } from "../../util/db";

import type { NextApiRequest, NextApiResponse } from "next";
import { ManagerContract__factory } from "../../typechain";
import {
  TOKE_CONTRACT,
  TOKE_STAKING_CONTRACT,
  TOKEMAK_MANAGER,
} from "../../constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await loadAll();

  res.status(200).json({});
}

export async function loadAll() {
  await loadTAssets();
  await loadTokeStaking();
  await updateDbBlocks();
}

export async function getAllReactors() {
  const managerContract = ManagerContract__factory.connect(
    TOKEMAK_MANAGER,
    getProvider()
  );

  const pools = [...(await managerContract.getPools())];

  const reactors = await prisma.reactor.findMany({
    where: { address: { notIn: pools.map(toBuffer) } },
  });

  pools.push(...reactors.map((reactor) => addressToHex(reactor.address)));
  return pools;
}

export function toBuffer(hexString: string) {
  return Buffer.from(arrayify(hexString));
}

async function loadTAssets() {
  const pools = await getAllReactors();

  pools.push(TOKE_CONTRACT); //toke token

  for (let pool of pools) {
    await load(pool, ERC20, "Transfer", prisma.erc20Transfer);
  }
}

export async function loadTokeStaking() {
  await load(
    TOKE_STAKING_CONTRACT,
    TokeStaking,
    "Deposited",
    prisma.tokeStakingDeposit
  );

  await load(
    TOKE_STAKING_CONTRACT,
    TokeStaking,
    "WithdrawCompleted",
    prisma.tokeStakingWithdrawCompleted
  );
}

async function load(
  address: string,
  abi: AbiWithEvents,
  event: string,
  prismaClient: any
) {
  const c = new Contract(address, abi, getProvider());

  const max_db_block =
    ((
      await prismaClient.aggregate({
        _max: { blockNumber: true },
        where: {
          address: toBuffer(address),
        },
      })
    )?._max?.blockNumber || 0) + 1;

  await getEvents(
    c,
    c.filters[event](),
    async (events) => {
      if (events.length > 0) {
        const data = transform(events, abi, event);
        await prismaClient.createMany({
          // @ts-ignore
          data,
        });
      }
    },
    max_db_block
  );
}

type AbiWithEvents = {
  name?: string;
  type: string;
  inputs: any[];
}[];

function transform(objs: Event[], abi: AbiWithEvents, name: string) {
  const inputs = abi.find(
    (obj) => obj.type === "event" && obj.name === name
  )?.inputs;
  if (!inputs) throw new Error("type not found");

  return objs.map(({ blockNumber, logIndex, transactionIndex, ...event }) =>
    inputs.reduce(
      (acc, input, i) => {
        let value = event.args?.[i].toString();

        switch (input.type) {
          case "address":
            value = toBuffer(value);
        }

        return { ...acc, [input.name]: value };
      },
      {
        blockNumber,
        transactionIndex,
        logIndex,
        address: toBuffer(event.address),
        transactionHash: toBuffer(event.transactionHash),
        data: toBuffer(event.data),
      }
    )
  );
}

async function getEvents<T extends BaseContract>(
  contract: T,
  filter: EventFilter,
  callback: (events: Array<Event>) => Promise<void> | void,
  fromBlock = 0,
  toBlock: number | undefined = undefined
) {
  let blockStack = [toBlock || (await getProvider().getBlockNumber())];
  let tempToBlock: number | undefined;
  while ((tempToBlock = blockStack.pop())) {
    try {
      let output = await contract.queryFilter(filter, fromBlock, tempToBlock);

      await callback(output);

      console.log(
        `found ${output.length} start ${fromBlock} end ${tempToBlock} stack ${blockStack}`
      );

      fromBlock = tempToBlock + 1;
    } catch (e) {
      // @ts-ignore
      if (e.error?.code === -32005) {
        blockStack.push(
          tempToBlock,
          Math.floor(fromBlock + (tempToBlock - fromBlock) / 2)
        );
        console.log("found too many");
      } else {
        throw e;
      }
    }
  }
  console.log("done", contract.address);
}
