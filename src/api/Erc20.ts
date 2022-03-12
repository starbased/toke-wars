import { useQuery } from "react-query";
import { ERC20__factory } from "../typechain";
import { provider } from "../util/providers";
import { DAOS, FIRST_BLOCK } from "../constants";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import untypedCache from "../cache/ec20Balance.json";

import { Log } from "@ethersproject/abstract-provider/src.ts";
import { getBlockNumber } from "./utils";

type Event = { args: (string | BigNumber)[] } & Log;

// @ts-ignore
const eventCache: Record<string, Event[]> = untypedCache;

function getContract(tokenContract: string) {
  return ERC20__factory.connect(tokenContract, provider);
}

export function useCurrentBalance(tokenContract: string, address: string) {
  return useQuery(["balance", tokenContract, address], () =>
    getContract(tokenContract).balanceOf(address)
  );
}

export function useTotalSupply(tokenContract: string) {
  return useQuery(["balance", tokenContract], () =>
    getContract(tokenContract).totalSupply()
  );
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

      const output = [];

      for (let event of allEvents) {
        output.push({
          ...event,
          time: new Date((await getBlockNumber(event.blockHash)) * 1000),
        });
      }
      return output;
    },
    {
      select: (events) => {
        // Filter out all events between addresses
        let filteredEvents = events.filter(({ args }) => {
          let from = args[0].toLowerCase();
          let to = args[1].toLowerCase();

          return (
            (filteredAddresses.includes(from) ||
              filteredAddresses.includes(to)) &&
            !(
              filteredAddresses.includes(to) && filteredAddresses.includes(from)
            )
          );
        });

        const output = [];
        let total = BigNumber.from(0);

        for (let event of filteredEvents) {
          const [from, , value] = event.args;

          if (filteredAddresses.includes(from.toLowerCase())) {
            total = total.sub(value);
          } else {
            total = total.add(value);
          }

          output.push({
            total: formatEther(total),
            time: event.time,
            event,
          });
        }

        return output;
      },
    }
  );
}
