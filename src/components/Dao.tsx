import { ERC20__factory, TokeStaking__factory } from "../typechain";
import { provider } from "../util/providers";
import { useQuery } from "react-query";
import { BigNumber } from "ethers";
import { TokeChart } from "./TokeChart";
import { FIRST_BLOCK, T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { formatEther } from "ethers/lib/utils";

type Props = {
  address: string;
  name: string;
};

export function useAmounts(address: string, token: string) {
  return useQuery(["contract", token, address], async () => {
    const contract = ERC20__factory.connect(token, provider);

    const events = (
      await Promise.all([
        contract.queryFilter(contract.filters.Transfer(address), FIRST_BLOCK),
        contract.queryFilter(
          contract.filters.Transfer(null, address),
          FIRST_BLOCK
        ),
      ])
    )
      .flatMap((obj) => obj)
      .sort((a, b) => a.blockNumber - b.blockNumber);

    const output = [];
    let total = BigNumber.from(0);

    for (let event of events) {
      const { from, value } = event.args;
      if (from.toLowerCase() === address.toLowerCase()) {
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
  });
}

function useNewStaking(address: string) {
  return useQuery(
    "newStaking",
    () => {
      const contract = TokeStaking__factory.connect(
        "0x96F98Ed74639689C3A11daf38ef86E59F43417D3",
        provider
      );
      return contract.queryFilter(contract.filters.Deposited());
    },
    {
      select(data) {
        return data.filter(
          (obj) => obj.args.account.toLowerCase() === address.toLowerCase()
        );
      },
    }
  );
}

export function Dao({ address, name }: Props) {
  const { data: newStaking } = useNewStaking(address);

  return (
    <div>
      <h1>
        {name} {address}
      </h1>
      <TokeChart address={address} />
      <h2>Toke</h2>
      <AmountsTable token={TOKE_CONTRACT} address={address} />
      <h2>tToke</h2>
      <AmountsTable token={T_TOKE_CONTRACT} address={address} />
      <h2>New staking</h2>
      <table>
        <thead>
          <tr>
            <td>Amount</td>
            <td>Block</td>
          </tr>
        </thead>
        <tbody>
          {newStaking?.map((obj) => (
            <tr key={obj.transactionHash}>
              <td>{formatEther(obj.args[1])}</td>
              <td>{obj.blockNumber}</td>
            </tr>
          )) || null}
        </tbody>
      </table>
    </div>
  );
}

function AmountsTable({ token, address }: { token: string; address: string }) {
  const { data } = useAmounts(address, token);

  return (
    <table>
      <thead>
        <tr>
          <td>Amount</td>
          <td>Date</td>
        </tr>
      </thead>
      <tbody>
        {data
          ? data.map((obj) => (
              <tr key={obj.event.transactionHash}>
                <td>{obj.total.toString()}</td>
                <td>{obj.time.toString()}</td>
              </tr>
            ))
          : null}
      </tbody>
    </table>
  );
}
