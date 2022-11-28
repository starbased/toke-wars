import { BaseContract, Contract, EventFilter, Event } from "ethers";
import { arrayify } from "ethers/lib/utils";

import ERC20 from "@/abi/ERC20.json";
import TokeStaking from "@/abi/TokeStaking.json";

import { addressToHex, getProvider, updateDbBlocks } from "@/utils";
import { prisma } from "utils/db";

import type { NextApiRequest, NextApiResponse } from "next";
import { ManagerContract__factory } from "@/typechain";
import {
  TOKE_CONTRACT,
  TOKE_STAKING_CONTRACT,
  TOKEMAK_MANAGER,
} from "@/constants";
import { load } from "utils/load";

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
