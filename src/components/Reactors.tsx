import { provider } from "../util/providers";
import { useQuery } from "react-query";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { TAsset__factory } from "../typechain";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

function runningTotal<T>(
  events: Iterable<T>,
  getValue: (t: T) => (n: BigNumber) => BigNumber
) {
  const output: { event: T; total: BigNumber }[] = [];

  let total = BigNumber.from(0);

  for (let event of events) {
    total = getValue(event)(total);

    output.push({
      total: total,
      event,
    });
  }

  return output;
}

export function Reactors() {
  const addresses = [
    ["0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84", "ALCX"],
    ["0xe7a7D17e2177f66D035d9D50A7f48d8D8E31532D", "OHM"],
    ["0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36", "WETH"],
  ];

  const [address, setAddress] = useState(
    "0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84"
  );

  const burn = "0x0000000000000000000000000000000000000000";

  const { data } = useQuery(
    ["reactor", address],
    async () => {
      const contract = TAsset__factory.connect(address, provider);

      let events = await contract.queryFilter(contract.filters.Transfer());

      events = events.filter(
        ({ args: { from, to } }) => from === burn || to === burn
      );

      return events;
    },
    {
      select: (events) =>
        runningTotal(
          events,
          ({ args: { from, value } }) =>
            (bn: BigNumber) =>
              from === burn ? bn.add(value) : bn.sub(value)
        ),
    }
  );

  let formattedData = data?.map(({ total, event: { blockNumber } }) => ({
    total: formatEther(total),
    blockNumber,
  }));

  return (
    <div>
      <label htmlFor="token">Select a token</label>
      <select
        name="token"
        value={address}
        style={{ color: "black" }}
        onChange={(event) => setAddress(event.currentTarget.value)}
      >
        {addresses.map(([address, name]) => (
          <option value={address} key={address}>
            {name}
          </option>
        ))}
      </select>

      <div style={{ width: "1000px", height: "400px" }}>
        {formattedData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{
                top: 0,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="blockNumber"
                // scale="time"
                type="number"
                // tickFormatter={dateFormatter}
                domain={[
                  () => formattedData[0]?.blockNumber,
                  () => formattedData[formattedData.length - 1]?.blockNumber,
                ]}
                // @ts-ignore
                // ticks={ticks}
              />
              <YAxis />
              <Tooltip
                // labelFormatter={dateFormatter}
                labelStyle={{ color: "black" }}
              />
              <Legend />
              <Area
                connectNulls={true}
                type="stepAfter"
                dataKey="total"
                stroke="#8884d8"
                fill="#8884d8"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
