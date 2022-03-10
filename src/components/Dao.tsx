import { ERC20__factory, TokeStaking__factory } from "../typechain";
import { provider } from "../util/providers";
import { useQuery } from "react-query";
import { BigNumber } from "ethers";
import { TokeChart } from "./TokeChart";
import { FIRST_BLOCK, T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { formatEther } from "ethers/lib/utils";
import { Table, Badge } from "react-bootstrap";

export function useAmounts(addresses: string[], token: string) {
  return useQuery(["contract", token, addresses], async () => {
    const contract = ERC20__factory.connect(token, provider);

    let events = (
      await Promise.all([
        // @ts-ignore
        contract.queryFilter(contract.filters.Transfer(addresses), FIRST_BLOCK),
        contract.queryFilter(
          // @ts-ignore
          contract.filters.Transfer(null, addresses),
          FIRST_BLOCK
        ),
      ])
    )
      .flatMap((obj) => obj)
      .sort((a, b) => a.blockNumber - b.blockNumber);

    const output = [];
    let total = BigNumber.from(0);

    const lower_addresses = addresses.map((address) => address.toLowerCase());

    events = events.filter(
      (event) =>
        !(
          lower_addresses.includes(event.args.from.toLowerCase()) &&
          lower_addresses.includes(event.args.to.toLowerCase())
        )
    );

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
  });
}

function useNewStaking(addresses: string[]) {
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
        const lower_addresses = addresses.map((address) =>
          address.toLowerCase()
        );

        return data.filter((obj) =>
          lower_addresses.includes(obj.args.account.toLowerCase())
        );
      },
    }
  );
}

type Props = {
  addresses: string[];
  name: string;
};

export function Dao({ addresses, name }: Props) {
  const { data: newStaking } = useNewStaking(addresses);

  return (
    <div>
      <h1>{name}</h1>
      <h4 style={{ display: "flex", gap: "5px" }}>
        {addresses.map((address) => (
          <Badge bg="secondary" key={address}>
            {address}
          </Badge>
        ))}
      </h4>
      <TokeChart address={addresses} />
      <h2>Toke</h2>
      <AmountsTable token={TOKE_CONTRACT} addresses={addresses} />
      <h2>tToke</h2>
      <AmountsTable token={T_TOKE_CONTRACT} addresses={addresses} />
      <h2>New staking</h2>
      <Table striped bordered hover>
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
      </Table>
    </div>
  );
}

function AmountsTable({
  token,
  addresses,
}: {
  token: string;
  addresses: string[];
}) {
  const { data } = useAmounts(addresses, token);

  return (
    <Table striped bordered hover>
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
    </Table>
  );
}
