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
import { formatNumber } from "utils/maths";
import { addMonths, differenceInMonths, intlFormat, parseISO } from "date-fns";
import { ReactNode } from "react";
import { Payload } from "recharts/types/component/DefaultTooltipContent";

type Props = {
  data: {
    timestamp: number;
  }[];
};

export const dateFormatter = (date: number) => intlFormat(new Date(date));

export const labelFunction = (
  label: number,
  payload: Array<Payload<number, string>>
) => {
  const total = payload.map((obj) => obj.value || 0).reduce((a, b) => a + b, 0);

  return dateFormatter(label) + ` (${formatNumber(total)})`;
};

export function BaseAreaGraph({
  data,
  children,
}: Props & { children: ReactNode }) {
  const startDate = parseISO("2021-10-01");

  const ticks = Array.from(
    Array(differenceInMonths(new Date(), startDate) + 1)
  ).map((_, i) => addMonths(startDate, i).getTime());

  let formatter = Intl.NumberFormat("en", { notation: "compact" });

  return (
    <ResponsiveContainer height={400}>
      <AreaChart
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          scale="time"
          type="number"
          tickFormatter={dateFormatter}
          domain={[() => startDate.getTime(), "dataMax"]}
          ticks={ticks}
        />
        <YAxis
          tickFormatter={(tick) => {
            if (tick === 0) {
              return "";
            }
            return formatter.format(tick);
          }}
          // domain={[0, (max: number) => max * 1.1]}
        />
        <Tooltip
          labelFormatter={labelFunction}
          labelStyle={{ color: "black" }}
          formatter={(value: any) => {
            return formatNumber(Number(value));
          }}
        />
        <Legend />
        {children}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TokeGraph({ data }: Props) {
  return (
    <BaseAreaGraph data={data}>
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
    </BaseAreaGraph>
  );
}
