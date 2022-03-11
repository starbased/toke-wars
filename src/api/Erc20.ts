import { useQuery } from "react-query";
import { ERC20__factory } from "../typechain";
import { provider } from "../util/providers";
import { FIRST_BLOCK } from "../constants";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

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

export function useAmounts(addresses: string[], tokenContract: string) {
  return useQuery(
    ["contract", tokenContract, addresses],
    async () => {
      const contract = getContract(tokenContract);

      let events = (
        await Promise.all([
          contract.queryFilter(
            // @ts-ignore
            contract.filters.Transfer(addresses),
            FIRST_BLOCK
          ),
          contract.queryFilter(
            // @ts-ignore
            contract.filters.Transfer(null, addresses),
            FIRST_BLOCK
          ),
        ])
      )
        .flatMap((obj) => obj)
        .sort((a, b) => a.blockNumber - b.blockNumber);

      // Filter out all events between dao addresses
      const lower_addresses = addresses.map((address) => address.toLowerCase());
      events = events.filter(
        (event) =>
          !(
            lower_addresses.includes(event.args.from.toLowerCase()) &&
            lower_addresses.includes(event.args.to.toLowerCase())
          )
      );

      // keep a running tally of the total
      const output = [];
      let total = BigNumber.from(0);

      for (let event of events) {
        const { from, value } = event.args;
        if (lower_addresses.includes(from.toLowerCase())) {
          total = total.sub(value);
        } else {
          total = total.add(value);
        }

        output.push({ total, event });
      }

      return Promise.all(
        output.map(async (obj) => ({
          total: formatEther(obj.total),
          time: new Date((await obj.event.getBlock()).timestamp * 1000), //new ethers call per getBlock()
          event: obj.event,
        }))
      );
    },
    {
      select(events) {
        return events;
      },
    }
  );
}
