import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import mapValues from "lodash/mapValues";
import mergeWith from "lodash/mergeWith";

import { Payload } from "recharts/types/component/DefaultTooltipContent";
import { IpfsRewardsRecord } from "@/pages/rewards/[address]";

type Props = {
  rewards: IpfsRewardsRecord[];
};

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

export function Graph({ rewards }: Props) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [showByCycle, setShowByCycle] = useState<boolean>(true);

  const { byCycle, aggregate } = useMemo(() => {
    const byCycle: Record<string, string>[] = [];
    const aggregate: Record<string, string>[] = [];

    let last: Record<string, string> = {};

    for (let i in rewards) {
      const nameObj = { name: parseInt(i).toString() };
      const data = rewards[i];

      if (!data) {
        byCycle.push(nameObj);
        aggregate.push({
          ...last,
          ...nameObj,
        });
      } else {
        let current = data.data.reduce((acc, obj) => {
          return { ...acc, [obj.description]: obj.amount };
        }, {});

        byCycle.push({
          ...mapValues(current, formatEther),
          ...nameObj,
        });

        aggregate.push({
          ...mapValues(
            // eslint-disable-next-line no-loop-func
            mergeWith(current, last, (a, b) => {
              if (a && b) {
                return (BigInt(a) + BigInt(b)).toString();
              } else if (a) {
                return a;
              } else {
                return b;
              }
            }),
            formatEther
          ),
          ...nameObj,
        });

        last = current;
      }
    }

    return { byCycle, aggregate };
  }, [rewards]);

  const set = new Set<string>(Object.keys(aggregate[aggregate.length - 1]));
  set.delete("name");

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={showByCycle ? byCycle : aggregate}
          margin={{
            top: 0,
            right: 0,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid stroke="#424242" strokeDasharray="3 3" />
          <XAxis dataKey="name">
            <Label
              style={{ fill: "ghostwhite" }}
              value="Cycle #"
              offset={-10}
              position="insideBottom"
            />
          </XAxis>
          <YAxis>
            <Label
              style={{ fill: "ghostwhite" }}
              value="Index (TOKE)"
              angle={-90}
              position="insideLeft"
            />
          </YAxis>
          <Tooltip
            contentStyle={{ color: "black" }}
            labelFormatter={(
              value: string,
              payload: Payload<string, string>[]
            ) => {
              const total = payload
                .map((obj) => (obj.value ? parseFloat(obj.value) || 0 : 0))
                .reduce((a, b) => a + b, 0);

              return `Cycle ${value} (${total})`;
            }}
          />
          <Legend
            wrapperStyle={{ bottom: -5 }}
            onClick={(e) => {
              if (hidden.includes(e.dataKey)) {
                hidden.splice(hidden.indexOf(e.dataKey), 1);
                setHidden([...hidden]);
              } else {
                setHidden([...hidden, e.dataKey]);
              }
            }}
          />
          {Array.from(set).map((key, i) => (
            <Area
              hide={hidden.includes(key)}
              type="monotone"
              dataKey={key}
              stackId="1"
              key={key}
              fill={graphColors[i]}
              stroke={graphColors[i]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div>
        <label htmlFor="checkbox" className="cursor-pointer">
          Aggregate data
        </label>

        <input
          id="checkbox"
          type="checkbox"
          className="ml-2 cursor-pointer"
          checked={!showByCycle}
          onChange={() => setShowByCycle(!showByCycle)}
        />
      </div>
    </div>
  );
}
