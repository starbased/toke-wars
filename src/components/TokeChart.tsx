import {
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";
import { sortBy } from "lodash";
import { T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { useAmounts } from "../api/Erc20";
import { useNewStaking } from "../api/TokeStaking";
import { addMonths, differenceInMonths, parseISO } from "date-fns";

export function TokeChart({ addresses }: { addresses: string[] }) {
  const { data: tokeEvents } = useAmounts(addresses, TOKE_CONTRACT);
  const { data: tTokeEvents } = useAmounts(addresses, T_TOKE_CONTRACT);
  const { data: newStaking } = useNewStaking(addresses);

  if (!tokeEvents || !tTokeEvents || !newStaking) {
    return <div>loading</div>;
  }

  const staking = [...tTokeEvents, ...newStaking];

  let data = [
    ...staking.map(({ time, total }) => ({
      time: time,
      tToke: parseInt(total),
    })),
    ...tokeEvents.map(({ time, total }) => ({
      time: time,
      toke: parseInt(total),
    })),
  ];
  data = sortBy(data, "time");

  if (data.length < 1) {
    return <div>No data</div>;
  }

  let joinedData = [];
  let lastDatum = { time: new Date(0), tToke: 0, toke: 0 };
  for (let datum of data) {
    if (lastDatum.time.getTime() == datum.time.getTime()) {
      if ("toke" in datum) {
        lastDatum.toke = datum.toke;
      } else if ("tToke" in datum) {
        lastDatum.tToke = datum.tToke;
      }
    } else {
      lastDatum = { ...lastDatum, ...datum };
      joinedData.push(lastDatum);
    }
  }

  joinedData.push({ ...joinedData[joinedData.length - 1], time: new Date() });

  const dateFormatter = (date: Date) => date.toLocaleDateString("en-US");

  const startDate = parseISO("2021-10-01");

  const ticks = Array.from(
    Array(differenceInMonths(new Date(), startDate) + 1)
  ).map((_, i) => addMonths(startDate, i));

  return (
    <div style={{ width: "1000px", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={joinedData}
          margin={{
            top: 0,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            scale="time"
            type="number"
            tickFormatter={dateFormatter}
            domain={[() => startDate, () => new Date()]}
            // @ts-ignore
            ticks={ticks}
          />
          <YAxis />
          <Tooltip labelFormatter={dateFormatter} />
          <Legend />
          <Area
            connectNulls={true}
            type="stepAfter"
            dataKey="tToke"
            stroke="#8884d8"
            fill="#8884d8"
            stackId="1"
          />
          <Area
            connectNulls={true}
            type="stepAfter"
            dataKey="toke"
            stroke="#82ca9d"
            fill="#82ca9d"
            stackId="1"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
