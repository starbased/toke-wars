import { Area } from "recharts";
import { orderBy } from "lodash";
import { BaseAreaGraph } from "./TokeGraph";

type Props = {
  data: {
    timestamp: number;
  }[];
};

export function DaosGraph({ data }: Props) {
  const orderedDaos = orderBy(
    Object.entries(data[data.length - 1])
      .map(([name, total]) => ({
        name,
        total,
      }))
      .filter(({ name }) => name !== "timestamp"),
    "total",
    "desc"
  );

  return (
    <BaseAreaGraph data={data}>
      {orderedDaos.map(({ name }, i) => (
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
    </BaseAreaGraph>
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
