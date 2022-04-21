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
import { formatNumber } from "../util/maths";
import { orderBy } from "lodash";

type Props = {
  data: {
    block_number: number;
  }[];
};

export function DaosGraph({ data }: Props) {
  const foo = orderBy(
    Object.entries(data[data.length - 1])
      .map(([name, total]) => ({
        name,
        total,
      }))
      .filter(({ name }) => name !== "block_number"),
    "total",
    "desc"
  );

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 0,
            right: 75,
            left: 75,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="block_number"
            // scale="time"
            type="number"
            // tickFormatter={dateFormatter}
            domain={[13401006, "dataMax"]}
            // @ts-ignore
            // ticks={ticks}
          />
          <YAxis
            tickFormatter={(value) => formatNumber(value)}
            // domain={[0, (max: number) => max * 1.1]}
          />
          <Tooltip
            // labelFormatter={labelFunction}
            labelStyle={{ color: "black" }}
            formatter={(value: any) => {
              return formatNumber(Number(value));
            }}
          />
          <Legend />
          {foo.map(({ name }, i) => (
            <Area
              key={name}
              dataKey={name}
              type="stepAfter"
              name={name}
              stackId="1"
              fill={graphColors[i]}
              stroke={graphColors[i]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const graphColors = [
  "#63b598",
  "#ce7d78",
  "#ea9e70",
  "#a48a9e",
  "#c6e1e8",
  "#648177",
  "#0d5ac1",
  "#f205e6",
  "#f2510e",
  "#4ca2f9",
  "#a4e43f",
  "#d298e2",
  "#6119d0",
  "#d2737d",
  "#c0a43c",
  "#651be6",
  "#79806e",
  "#61da5e",
];
