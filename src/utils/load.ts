import { BaseContract, Contract, Event, EventFilter } from "ethers";
import { getProvider } from "utils/index";
import { toBuffer } from "@/pages/api/updateEvents";

export type AbiWithEvents = {
  name?: string;
  type: string;
  inputs: any[];
}[];

export async function load(
  address: string,
  abi: AbiWithEvents,
  eventString: string,
  prismaClient: any,
  eventFilter?: EventFilter
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
    eventFilter || c.filters[eventString](),
    async (events) => {
      if (events.length > 0) {
        const data = transform(events, abi, eventString);
        await prismaClient.createMany({
          // @ts-ignore
          data,
        });
      }
    },
    max_db_block
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
