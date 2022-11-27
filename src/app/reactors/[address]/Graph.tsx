"use client";

import { eachMonthOfInterval } from "date-fns";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "utils/maths";

type Event = {
  date: number;
  total: string;
  value: string;
};

export function Graph({ events }: { events: Event[] }) {
  const formattedEvents = events.map((obj) => ({
    ...obj,
    total: parseFloat(obj.total),
    value: parseFloat(obj.value),
  }));

  const dateFormatter = (date: number) =>
    new Date(date).toLocaleDateString("en-US");

  const ticks = eachMonthOfInterval({
    start: new Date(formattedEvents[0].date),
    end: new Date(),
  }).map((obj) => obj.getTime());

  let formatter = Intl.NumberFormat("en", { notation: "compact" });

  const yTickFormatter = (tick: number) => {
    if (tick === 0) {
      return "";
    }
    return formatter.format(tick);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={formattedEvents}
        margin={{
          top: 0,
          right: 10,
          left: 20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          scale="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={dateFormatter}
          tickCount={5}
          ticks={ticks}
        />
        <YAxis tickFormatter={yTickFormatter} unit="$">
          <Label
            style={{ fill: "ghostwhite" }}
            value="USD Value"
            angle={-90}
            offset={10}
            position="left"
          />
        </YAxis>
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={yTickFormatter}
        >
          <Label
            style={{ fill: "ghostwhite" }}
            value="Total Tokens"
            angle={90}
            offset={0}
            position="right"
          />
        </YAxis>
        <Tooltip
          labelFormatter={dateFormatter}
          labelStyle={{ color: "black" }}
          formatter={(value: any) => formatNumber(value)}
        />
        <Legend />
        <Line
          connectNulls={true}
          dataKey="total"
          name="Total Tokens"
          stroke="#8884d8"
          yAxisId="right"
          dot={false}
        />
        <Area connectNulls={true} dataKey="value" name="USD Value" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
