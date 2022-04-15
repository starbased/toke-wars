import { useQueries } from "react-query";
import { ERC20__factory } from "../../typechain";
import { provider } from "../../util/providers";
import { formatEther } from "ethers/lib/utils";
import { TransferEvent } from "../../typechain/ERC20";
import { groupBy, orderBy } from "lodash";
import { useGeckoData } from "../../api/coinGecko";
import { BigNumber } from "bignumber.js";
import { Formatter } from "../Formatter";

export function Revenue() {
  const tokens = {
    "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b": {
      name: "CVX",
      gecko_id: "convex-finance",
    },
    "0xd533a949740bb3306d119cc777fa900ba034cd52": {
      name: "CRV",
      gecko_id: "curve-dao-token",
    },
  };

  const queries = useQueries(
    Object.entries(tokens).map(([tokenContract]) => ({
      queryKey: ["contract", tokenContract],
      queryFn: () => {
        const contract = ERC20__factory.connect(tokenContract, provider);

        return contract.queryFilter(
          contract.filters.Transfer(
            "0xA86e412109f77c45a3BC1c5870b880492Fb86A14",
            "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B"
          )
        );
      },
    }))
  );

  let data = queries.reduce<TransferEvent[]>(
    (acc, obj) => [...acc, ...(obj.data || [])],
    []
  );

  const usdValues = Object.entries(tokens)
    .map(([, { gecko_id }]) => useGeckoData(gecko_id))
    .reduce((acc, obj) => {
      if (obj.data) {
        return {
          ...acc,
          [obj.data.contract_address]: obj.data.market_data.current_price.usd,
        };
      }
      return { ...acc };
    }, {});

  data = orderBy(data, "blockNumber");

  const totals = Object.entries(groupBy(data, "address")).map(
    ([address, data]) => {
      return {
        address,
        value: new BigNumber(
          formatEther(
            data.map((obj) => obj.args.value).reduce((a, b) => a.add(b))
          )
        )
          .times(usdValues[address.toLowerCase()])
          .toNumber(),
      };
    }
  );

  return (
    <div>
      <h1>events</h1>
      <table>
        <thead>
          <tr>
            <th>Block Number</th>
            <th>Tx</th>
            <th>Coin</th>
            <th>Amount</th>
            <th>USD Value</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((tx) => (
            <tr key={tx.transactionHash + tx.address}>
              <td>{tx.blockNumber}</td>
              <td>
                <a
                  href={`https://etherscan.io/tx/${tx.transactionHash}`}
                  target="_blank"
                >
                  {tx.transactionHash}
                </a>
              </td>
              <td>{tokens[tx.address.toLowerCase()].name}</td>
              <td>{formatEther(tx.args.value.toString())}</td>
              <td>
                <Formatter
                  currency
                  value={new BigNumber(formatEther(tx.args.value.toString()))
                    .times(usdValues[tx.address.toLowerCase()])
                    .toNumber()}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>Totals</h1>
      <table>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Amount</th>
            <th>USD Value</th>
          </tr>
        </thead>
        <tbody>
          {totals?.map((tx) => (
            <tr key={tx.address}>
              <td>{tokens[tx.address.toLowerCase()].name}</td>
              <td>{tx.value}</td>
              <td>
                <Formatter currency value={tx.value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1>total total: </h1>
      <Formatter
        currency
        value={totals
          .map((obj) => obj.value)
          .reduce<number>((a, b) => a + b, 0)}
      />
    </div>
  );
}
