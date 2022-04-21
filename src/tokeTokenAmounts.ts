import { prisma } from "./util/db";
import {
  FIRST_BLOCK,
  T_TOKE_CONTRACT,
  TOKE_CONTRACT,
  TOKE_STAKING_CONTRACT,
} from "./constants";
import { getProvider } from "./util";
import { ERC20__factory, TokeStaking__factory } from "./typechain";
import { TypedEvent } from "./typechain/common";
import {
  DepositedEvent,
  WithdrawCompletedEvent,
} from "./typechain/TokeStaking";
import { TransferEvent } from "./typechain/ERC20";

export async function updateAll() {
  await updateErc20("toke");
  await updateErc20("tToke");
  await updateNewStaking();
}

async function getBlocks(
  forceRefresh: boolean,
  type: string,
  addresses?: string[]
) {
  let toBlock: undefined | number;
  if (!addresses) {
    //if no addresses are provided update everything
    addresses = (await prisma.daoAddress.findMany()).map((obj) => obj.address);
  } else {
    // never update past the last block in the database, or it might skip some transactions
    // on different addresses
    let lastBlock = await prisma.daoTransaction.aggregate({
      _max: {
        blockNumber: true,
      },
      where: { type },
    });

    toBlock = lastBlock._max.blockNumber || undefined;
  }

  let fromBlock = FIRST_BLOCK;

  if (!forceRefresh) {
    let lastBlock = await prisma.daoTransaction.aggregate({
      _max: {
        blockNumber: true,
      },
      where: { daoAddress: { in: addresses }, type },
    });

    fromBlock = (lastBlock._max.blockNumber || FIRST_BLOCK) + 1;
  }

  return { fromBlock, toBlock, addresses };
}

export async function updateNewStaking(
  forceRefresh = false,
  inAddresses?: string[]
) {
  const provider = getProvider();
  const contract = TokeStaking__factory.connect(
    TOKE_STAKING_CONTRACT,
    provider
  );
  const type = "newStake";

  const { fromBlock, toBlock, addresses } = await getBlocks(
    forceRefresh,
    type,
    inAddresses
  );

  const deposit = await contract.queryFilter(
    contract.filters.Deposited(),
    fromBlock,
    toBlock
  );

  const withdrawal = await contract.queryFilter(
    contract.filters.WithdrawCompleted(),
    fromBlock,
    toBlock
  );

  const commonTransform = ({ blockNumber, transactionHash }: TypedEvent) => ({
    blockNumber,
    transactionHash,
    type,
  });

  const addressSet = new Set(addresses);
  const filter = (obj: DepositedEvent | WithdrawCompletedEvent) =>
    addressSet.has(obj.args.account);

  await prisma.$transaction([
    prisma.daoTransaction.createMany({
      data: deposit.filter(filter).map((obj) => ({
        ...commonTransform(obj),
        value: obj.args.amount.toString(),
        daoAddress: obj.args.account,
      })),
    }),

    prisma.daoTransaction.createMany({
      data: withdrawal.filter(filter).map((obj) => ({
        ...commonTransform(obj),
        value: "-" + obj.args.amount.toString(),
        daoAddress: obj.args.account,
      })),
    }),
  ]);
}

export async function updateErc20(
  type: "tToke" | "toke",
  forceRefresh = false,
  inAddresses?: string[]
) {
  let contract_address;

  switch (type) {
    case "tToke":
      contract_address = T_TOKE_CONTRACT;
      break;
    case "toke":
      contract_address = TOKE_CONTRACT;
  }

  const provider = getProvider();
  const contract = ERC20__factory.connect(contract_address, provider);

  const { fromBlock, toBlock, addresses } = await getBlocks(
    forceRefresh,
    type,
    inAddresses
  );

  const fromEvents = await contract.queryFilter(
    // @ts-ignore
    contract.filters.Transfer(addresses),
    fromBlock,
    toBlock
  );
  const toEvents = await contract.queryFilter(
    // @ts-ignore
    contract.filters.Transfer(null, addresses),
    fromBlock,
    toBlock
  );

  const commonTransform = ({
    blockNumber,
    transactionHash,
    args: { to, from },
  }: TransferEvent) => ({
    blockNumber,
    transactionHash,
    to,
    from,
    type,
  });

  await prisma.$transaction([
    prisma.daoTransaction.createMany({
      data: fromEvents.map((obj) => ({
        ...commonTransform(obj),
        value: "-" + obj.args.value.toString(),
        daoAddress: obj.args.from,
      })),
    }),

    prisma.daoTransaction.createMany({
      data: toEvents.map((obj) => ({
        ...commonTransform(obj),
        value: obj.args.value.toString(),
        daoAddress: obj.args.to,
      })),
    }),
  ]);
}
