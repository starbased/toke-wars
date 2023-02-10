import { isEqual, startOfDay } from "date-fns";
import { prisma } from "utils/db";
import {
  ACC_CONTRACT,
  T_TOKE_CONTRACT,
  TOKE_CONTRACT,
  TOKE_STAKING_CONTRACT,
} from "./constants";
import { addressToHex } from "./utils";

export async function groupByTokeType(daoName?: string) {
  const records = await prisma.$queryRawUnsafe<
    {
      type: Buffer;
      total: number;
      timestamp: Date;
    }[]
  >(`
      select transactions.address as type,
             round(sum(adjusted_value) over (PARTITION BY transactions.address order by block_number) / 10 ^ 18::numeric,
                   0)::integer as total,
             timestamp
      from dao_txs transactions
         inner join blocks on block_number = number
         inner join contracts on contracts.address = transactions.address
        ${daoName ? `where dao_name ='${daoName}'` : ""}
      order by block_number
  `);
  const typeMap: Record<string, string> = {
    [TOKE_CONTRACT.toLowerCase()]: "toke",
    [T_TOKE_CONTRACT.toLowerCase()]: "tToke",
    [TOKE_STAKING_CONTRACT.toLowerCase()]: "newStake",
    [ACC_CONTRACT.toLowerCase()]: "acc",
  };

  return getData(
    records.map((record) => ({
      ...record,
      type: typeMap[addressToHex(record.type)],
    }))
  );
}

export type GraphRecord = {
  type: string;
  total: number;
  timestamp: Date;
};

export async function getData(records: GraphRecord[]) {
  let previous = { timestamp: new Date(records[0].timestamp).getTime() };

  let temp = records.map<{
    timestamp: number;
  }>(({ type, total, timestamp }) => ({
    [type]: total,
    timestamp: new Date(timestamp).getTime(),
  }));

  //add a value for now at the end to extend the graph to now
  temp.push({ timestamp: new Date().getTime() });

  return temp
    .map((current) => {
      const out = { ...previous, ...current };
      return (previous = out);
    })
    .filter(
      ({ timestamp }, i, array) =>
        !isEqual(startOfDay(timestamp), startOfDay(array[i + 1]?.timestamp))
    );
}
