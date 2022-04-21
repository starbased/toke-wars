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

type Props = {
  data: {
    block_number: number;
  }[];
};

export function TokeGraph({ data }: Props) {
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
          <Area
            type="stepAfter"
            dataKey="newStake"
            name="TOKE (Migrated)"
            stackId="1"
          />
          <Area
            type="stepAfter"
            dataKey="tToke"
            name="tTOKE"
            stroke="#8884d8"
            fill="#8884d8"
            stackId="1"
          />
          <Area
            type="stepAfter"
            dataKey="toke"
            name="TOKE"
            stroke="#82ca9d"
            fill="#82ca9d"
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
