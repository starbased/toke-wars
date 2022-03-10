import { TokeChart } from "./TokeChart";
import { T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { Table, Badge } from "react-bootstrap";
import { useAmounts } from "../api/Erc20";
import { useNewStaking } from "../api/TokeStaking";

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
      <TokeChart addresses={addresses} />
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
            <tr key={obj.event.transactionHash}>
              <td>{obj.total}</td>
              <td>{obj.time.toString()}</td>
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
