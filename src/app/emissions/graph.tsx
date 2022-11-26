"use client";

import type { getTotals } from "./page";

import {
  Area,
  ComposedChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { useHiddenLabels } from "@/hooks/useHiddenLabel";
import { formatNumber } from "@/utils/maths";
import { GRAPH_COLORS } from "@/constants";
import { useTokePrice } from "hooks/useTokenPrice";

export function Graph({
  totals,
}: {
  totals: Awaited<ReturnType<typeof getTotals>>;
}) {
  const { onClick, shouldHide } = useHiddenLabels();
  const yFormatter = Intl.NumberFormat("en", { notation: "compact" });

  // Get most up-to-date token price
  const toke_price = useTokePrice();
  const lastTotal = totals[totals.length - 1];

  if (lastTotal && toke_price !== 0) {
    lastTotal.usdValue = lastTotal.total * toke_price;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={totals}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="cycle"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={Array.from(
            { length: totals.length / 2 },
            (v, i) => i * 2 + 201
          )}
        />
        <YAxis
          tickFormatter={(tick) => yFormatter.format(tick)}
          yAxisId="right"
          orientation="right"
        >
          <Label
            style={{ fill: "ghostwhite" }}
            value="Toke"
            angle={-90}
            offset={10}
            position="right"
          />
        </YAxis>
        <YAxis
          tickFormatter={(tick) => yFormatter.format(tick)}
          unit="$"
          yAxisId="left"
          orientation="left"
        ></YAxis>

        <Tooltip
          labelStyle={{ color: "black" }}
          labelFormatter={(label, payload: Payload<number, string>[]) => {
            return `Cycle ${label} (${formatNumber(
              payload[0]?.payload?.total,
              2
            )})`;
          }}
          formatter={(amount: number) => formatNumber(amount, 2)}
        />
        <Legend onClick={onClick} />

        {["LP", "Pair Reactor", "LD", "Reactor"].map((name, i) => (
          <Area
            hide={shouldHide(name)}
            key={name}
            dataKey={name}
            stackId="1"
            fill={GRAPH_COLORS[i % GRAPH_COLORS.length]}
            stroke={GRAPH_COLORS[i % GRAPH_COLORS.length]}
            yAxisId="right"
          />
        ))}

        <Line
          connectNulls={true}
          dataKey="usdValue"
          name="USD Value"
          stroke="#8884d8"
          yAxisId="left"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
