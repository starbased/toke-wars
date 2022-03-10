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
import { T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";

export function TokeChart({ address }: { address: string }) {
  const { data: tokeEvents } = useAmounts(address, TOKE_CONTRACT);
  const { data: tTokeEvents } = useAmounts(address, T_TOKE_CONTRACT);

  if (!tokeEvents || !tTokeEvents) {
    return <div>loading</div>;
  }

  let data = [
    ...tTokeEvents.map(({ time, total }) => ({
      time: time.getTime() + 1, //todo: weird hack to get the graph to work, they need to be merged so that duplicate times don't exist
      tToke: parseInt(total),
    })),
    ...tokeEvents.map(({ time, total }) => ({
      time: time.getTime(),
      toke: parseInt(total),
    })),
    { time: new Date().getTime() },
  ];

  data = sortBy(data, "time");

  return (
    <div style={{ width: "1000px", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          // width={500}
          // height={300}
          data={data}
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
            dataKey="toke"
            stroke="#82ca9d"
          />
          <Line
            connectNulls={true}
            type="stepAfter"
            dataKey="tToke"
            stroke="#8884d8"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
