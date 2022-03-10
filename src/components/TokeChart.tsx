import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAmounts } from "./Dao";
import { sortBy } from "lodash";

export function TokeChart({ address }: { address: string }) {
  const { data } = useAmounts(
    address,
    "0x2e9d63788249371f1DFC918a52f8d799F4a38C94"
  );

  const { data: data2 } = useAmounts(
    address,
    "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930"
  );

  if (!data || !data2) {
    return <div>loading</div>;
  }

  let foo = [
    ...data.map(({ time, total }) => ({
      time: time.getTime() + 1, //todo: weird hack to get the graph to work, they need to be merged so that duplicate times don't exist
      tToke: parseInt(total),
    })),
    ...data2.map(({ time, total }) => ({
      time: time.getTime(),
      toke: parseInt(total),
    })),
    { time: new Date().getTime() },
  ];

  foo = sortBy(foo, "time");

  console.log(foo);

  return (
    <div style={{ width: "1000px", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          // width={500}
          // height={300}
          data={foo}
          margin={{
            top: 50,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" scale="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            connectNulls={true}
            type="stepAfter"
            dataKey="tToke"
            stroke="#8884d8"
          />
          <Line
            connectNulls={true}
            type="stepAfter"
            dataKey="toke"
            stroke="#82ca9d"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
