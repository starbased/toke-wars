import { useQuery } from "react-query";
import { TokeStaking__factory } from "../typechain";
import { provider } from "../util/providers";
import { DAOS, TOKE_STAKING_CONTRACT } from "../constants";
import { BigNumber } from "ethers";
import { estimateTime, runningTotal } from "./utils";
import { getCacheInfo, Event } from "./Erc20";

export function useNewStaking(addresses: string[]) {
  //todo: this only deals with deposits not withdrawals right now
  const queryKey = "newStaking";
  return useQuery(
    queryKey,
    async () => {
      const contract = TokeStaking__factory.connect(
        TOKE_STAKING_CONTRACT,
        provider
      );

      const { cached, startingBlock } = getCacheInfo(queryKey);

      const events = await contract.queryFilter(
        contract.filters.Deposited(),
        startingBlock
      );

      // Filter out all addresses not cared about
      const knownAddresses = DAOS.flatMap((dao) =>
        dao.addresses.map((address) => address.toLowerCase())
      );

      const filteredEvents = events.filter(({ args: [address] }) =>
        knownAddresses.includes(address.toLowerCase())
      );

      const allEvents = [...cached, ...filteredEvents];
      if (filteredEvents.length > 0) {
        (window as any).eventCache[queryKey] = allEvents;
      }

      const output: (Event<[string, BigNumber]> & { time: Date })[] = [];

      for (let event of allEvents) {
        output.push({
          ...event,
          time: await estimateTime(event.blockNumber),
        });
      }
      return output;
    },
    {
      select(data) {
        const lower_addresses = addresses.map((address) =>
          address.toLowerCase()
        );

        const filteredData = data.filter((obj) =>
          lower_addresses.includes(obj.args[0].toLowerCase())
        );

        return runningTotal(
          filteredData,
          ({ args: [, value] }) =>
            (bn) =>
              bn.add(value)
        );
      },
    }
  );
}
