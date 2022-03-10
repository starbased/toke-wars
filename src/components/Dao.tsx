import { ERC20__factory } from "../typechain";
import { provider } from "../util/providers";
import { useQuery } from "react-query";
import { BigNumber } from "ethers";
import { TokeChart } from "./TokeChart";
import { FIRST_BLOCK, T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";

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
        total: obj.total
          .div(10 ** 10)
          .div(10 ** 8)
          .toString(),
        time: new Date((await obj.event.getBlock()).timestamp * 1000), //new ethers call per getBlock()
        event: obj.event,
      }))
    );
  });
}

export function Dao({ address, name }: Props) {
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
