import { useQuery } from "react-query";
import { ERC20__factory } from "../typechain";
import { provider } from "../util/providers";
import { DAOS, FIRST_BLOCK } from "../constants";
import { BigNumber } from "ethers";
import untypedCache from "../cache/ec20Balance.json";

import { Log } from "@ethersproject/abstract-provider/src.ts";
import { estimateTime, runningTotal } from "./utils";

export type Event<T> = { args: T } & Log;

// @ts-ignore
const eventCache: Record<string, Event[]> = untypedCache;

function getContract(tokenContract: string) {
  return ERC20__factory.connect(tokenContract, provider);
}

(window as any).eventCache = eventCache;

export function getCacheInfo(key: string) {
  let cached = eventCache[key] || [];
  let startingBlock = FIRST_BLOCK;
  if (cached.length > 0) {
    startingBlock = cached[cached.length - 1].blockNumber + 1;
  }
  return { cached, startingBlock };
}

export function useAmounts(
  tokenContract: string,
  filteredAddresses: string[],
  allAddresses = Object.values(DAOS).flatMap((obj) => obj.addresses)
) {
  filteredAddresses = filteredAddresses.map((address) => address.toLowerCase());

  const queryKey = ["contract", tokenContract, allAddresses];
  return useQuery(
    queryKey,
    async () => {
      const contract = getContract(tokenContract);

      const localKey = queryKey.reduce<string>(
        (a, b) => a.toString() + b.toString(),
        ""
      );

      const { cached, startingBlock } = getCacheInfo(localKey);

      const newEvents = (
        await Promise.all([
          contract.queryFilter(
            // @ts-ignore
            contract.filters.Transfer(allAddresses),
            startingBlock
          ),
          contract.queryFilter(
            // @ts-ignore
            contract.filters.Transfer(null, allAddresses),
            startingBlock
          ),
        ])
      )
        .flatMap((obj) => obj)
        .sort((a, b) => a.blockNumber - b.blockNumber);

      const allEvents = [...cached, ...newEvents];
      if (newEvents.length > 0) {
        (window as any).eventCache[localKey] = allEvents;
      }

      const output: (Event<[string, string, BigNumber]> & { time: Date })[] =
        [];

      for (let event of allEvents) {
        output.push({
          ...event,
          time: await estimateTime(event.blockNumber),
        });
      }
      return output;
    },
    {
      select: (events) => {
        // Filter out all events between addresses
        let filteredEvents = events.filter(({ args: [bigFrom, bigTo] }) => {
          let from = bigFrom.toLowerCase();
          let to = bigTo.toLowerCase();

          return (
            (filteredAddresses.includes(from) ||
              filteredAddresses.includes(to)) &&
            !(
              filteredAddresses.includes(to) && filteredAddresses.includes(from)
            )
          );
        });

        return runningTotal(
          filteredEvents,
          ({ args: [from, , value] }) =>
            (bn) =>
              filteredAddresses.includes(from.toLowerCase())
                ? bn.sub(value)
                : bn.add(value)
        );
      },
    }
  );
}
