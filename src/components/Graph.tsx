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
import {
  Box,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Spacer,
  Switch,
} from "@chakra-ui/react";
import { CycleInfoType } from "./Totals";

type Props = {
  rewards: (CycleInfoType | undefined)[];
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
      const nameObj = { name: i.toString() };
      const data = rewards[i];

      if (!data) {
        byCycle.push(nameObj);
        aggregate.push({
          ...last,
          ...nameObj,
        });
      } else {
        let current = data?.summary?.breakdown.reduce((acc, obj) => {
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
            right: 25,
            left: 25,
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
            labelFormatter={(value) => "Cycle " + value}
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

      <FormControl display="flex" alignItems="center">
        <Center>
          <Flex>
            <Box px="2">
              <FormLabel>Aggregate</FormLabel>
            </Box>
            <Spacer />
            <Box px="2">
              <Switch
                isChecked={!showByCycle}
                onChange={() => setShowByCycle(!showByCycle)}
              />
            </Box>
          </Flex>
        </Center>
      </FormControl>
    </div>
  );
}
