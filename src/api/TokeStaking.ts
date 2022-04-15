import { useQuery } from "react-query";
import { TokeStaking__factory } from "../typechain";
import { provider } from "../util/providers";
import { DAOS, TOKE_STAKING_CONTRACT } from "../constants";
import { BigNumber } from "ethers";
import { estimateTime, runningTotal } from "./utils";
import { getCacheInfo, Event } from "./Erc20";

export function useNewStaking(addresses: string[]) {
  const queryKey = "newStaking";
  return useQuery(
    queryKey,
    async () => {
      const contract = TokeStaking__factory.connect(
        TOKE_STAKING_CONTRACT,
        provider
      );

      // Filter out all addresses not cared about
      const knownAddresses = DAOS.flatMap((dao) =>
        dao.addresses.map((address) => address.toLowerCase())
      );

      const { cached, startingBlock } = getCacheInfo(queryKey);

      const deposits = await contract.queryFilter(
        contract.filters.Deposited(),
        startingBlock
      );

      const filteredDeposits = deposits.filter(({ args: [address] }) =>
        knownAddresses.includes(address.toLowerCase())
      );

      const withdrawals = await contract.queryFilter(
        contract.filters.WithdrawCompleted(),
        startingBlock
      );

      const filteredWithdrawals = withdrawals.filter(({ args: [address] }) =>
        knownAddresses.includes(address.toLowerCase())
      );

      const allEvents = [
        ...cached,
        ...filteredDeposits,
        ...filteredWithdrawals,
      ];

      if (filteredDeposits.length > 0) {
        (window as any).eventCache[queryKey] = allEvents;
      }

      const output: (Event<[string, BigNumber, BigNumber]> & { time: Date })[] =
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
      select(data) {
        const lower_addresses = addresses.map((address) =>
          address.toLowerCase()
        );

        const filteredData = data.filter((obj) =>
          lower_addresses.includes(obj.args[0].toLowerCase())
        );

        return runningTotal(
          filteredData,
          ({ args: [, add, minus] }) =>
            (bn) =>
              bn.add(add).sub(minus)
        );
      },
    }
  );
}
