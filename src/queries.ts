import { isEqual, startOfDay } from "date-fns";
import { prisma } from "./util/db";
import {
  T_TOKE_CONTRACT,
  TOKE_CONTRACT,
  TOKE_STAKING_CONTRACT,
} from "./constants";

export async function groupByTokeType(daoName?: string) {
  const records = await prisma.$queryRawUnsafe<
    {
      type: Buffer;
      total: number;
      timestamp: Date;
    }[]
  >(`
      select dt.address as type,
             round(sum(adjusted_value) over (PARTITION BY dt.address order by block_number) / 10 ^ 18::numeric,
                   0)::integer as total,
             timestamp
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions_v dt on da.address = dt.account
               inner join blocks on block_number = number
        ${daoName ? `where daos.name ='${daoName}'` : ""}
      order by block_number
  `);
  const typeMap: Record<string, string> = {
    [TOKE_CONTRACT.toLowerCase()]: "toke",
    [T_TOKE_CONTRACT.toLowerCase()]: "tToke",
    [TOKE_STAKING_CONTRACT.toLowerCase()]: "newStake",
  };

  return getData(
    records.map((record) => ({
      ...record,
      type: typeMap["0x" + record.type.toString("hex")],
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
