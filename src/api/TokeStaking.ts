import { useQuery } from "react-query";
import { TokeStaking__factory } from "../typechain";
import { provider } from "../util/providers";
import { DAOS, TOKE_STAKING_CONTRACT } from "../constants";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { getBlockNumber } from "./utils";
import { getCacheInfo } from "./Erc20";

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
      const knownAddresses = DAOS.flatMap((d) =>
        d.addresses.map((o) => o.toLowerCase())
      );

      const filteredEvents = events.filter((event) =>
        knownAddresses.includes(event.args[0].toLowerCase())
      );

      const allEvents = [...cached, ...filteredEvents];
      if (filteredEvents.length > 0) {
        (window as any).eventCache[queryKey] = allEvents;
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
      select(data) {
        const lower_addresses = addresses.map((address) =>
          address.toLowerCase()
        );

        const filteredData = data.filter((obj) =>
          lower_addresses.includes(obj.args[0].toLowerCase())
        );

        // keep a running tally of the total
        const output = [];
        let total = BigNumber.from(0);

        for (let event of filteredData) {
          total = total.add(event.args[1]);
          output.push({ ...event, total: formatEther(total) });
        }

        return output;
      },
    }
  );
}
