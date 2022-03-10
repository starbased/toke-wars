import { useQuery } from "react-query";
import { TokeStaking__factory } from "../typechain";
import { provider } from "../util/providers";
import { DAOS, TOKE_STAKING_CONTRACT } from "../constants";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

export function useNewStaking(addresses: string[]) {
  //todo: this only deals with deposits not withdrawals right now
  return useQuery(
    "newStaking",
    async () => {
      const contract = TokeStaking__factory.connect(
        TOKE_STAKING_CONTRACT,
        provider
      );
      const events = await contract.queryFilter(contract.filters.Deposited());

      // Filter out all addresses not cared about
      const knownAddresses = DAOS.flatMap((d) =>
        d.addresses.map((o) => o.toLowerCase())
      );

      const filteredEvents = events.filter((event) =>
        knownAddresses.includes(event.args.account.toLowerCase())
      );

      return Promise.all(
        filteredEvents.map(async (event) => ({
          total: event.args.amount,
          time: new Date((await event.getBlock()).timestamp * 1000), //new ethers call per getBlock()
          event,
        }))
      );
    },
    {
      select(data) {
        const lower_addresses = addresses.map((address) =>
          address.toLowerCase()
        );

        const filteredData = data.filter((obj) =>
          lower_addresses.includes(obj.event.args.account.toLowerCase())
        );

        // keep a running tally of the total
        const output = [];
        let total = BigNumber.from(0);

        for (let event of filteredData) {
          total = total.add(event.total);
          output.push({ ...event, total: formatEther(total) });
        }

        return output;
      },
    }
  );
}
