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
import { orderBy, sortBy } from "lodash";
import { DAOS, T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { useAmounts } from "../api/Erc20";
import { useNewStaking } from "../api/TokeStaking";
import { addMonths, differenceInMonths, isEqual, parseISO } from "date-fns";
import { formatNumber, getAmount } from "../util/maths";
import { formatEther } from "ethers/lib/utils";
import BigNumber from "bignumber.js";
import { graphColors } from "./Rewards/Graph";

export function useTotals(addresses) {
  const { data: tokeEvents } = useAmounts(TOKE_CONTRACT, addresses);
  const { data: tTokeEvents } = useAmounts(T_TOKE_CONTRACT, addresses);
  const { data: newStaking } = useNewStaking(addresses);

  const total = getAmount([tokeEvents, tTokeEvents, newStaking]);

  return {
    tokeEvents,
    tTokeEvents,
    newStaking,
    total,
    isLoading: !tokeEvents || !tTokeEvents || !newStaking,
  };
}

function makeMapFn(key: string) {
  return ({ time, total }) => ({
    time,
    [key]: formatEther(total),
  });
}

export function HoldingsByDaoChart() {
  let daoTotals = DAOS.flatMap(({ addresses, name }) => {
    const { tokeEvents, tTokeEvents, newStaking, isLoading } =
      useTotals(addresses);

    if (isLoading) {
      return;
    }

    let data = [
      ...tTokeEvents.map(makeMapFn("tToke")),
      ...newStaking.map(makeMapFn("newStake")),
      ...tokeEvents.map(makeMapFn("toke")),
    ];
    data = sortBy(data, "time");

    let lastDatum = { time: new Date(0), tToke: "0", toke: "0" };
    let joinedData = data
      .map((datum) => {
        lastDatum = { ...lastDatum, ...datum };
        return lastDatum;
      })
      .filter(({ time }, i, array) => !isEqual(time, array[i + 1]?.time));

    return joinedData.map(({ time, ...foo }) => {
      return {
        time,
        [name]: Object.entries(foo).reduce(
          (acc, [, value]) =>
            new BigNumber(value.toString()).plus(acc).toString(),
          "0"
        ),
      };
    });
  });

  if (daoTotals.includes(undefined)) {
    return <div>Loading Chart</div>;
  }

  daoTotals = sortBy(daoTotals, "time");

  let lastDatum2 = { time: new Date(0) };
  let joinedData = daoTotals.map((datum) => {
    lastDatum2 = { ...lastDatum2, ...datum };
    return lastDatum2;
  });

  joinedData.push({ ...joinedData[joinedData.length - 1], time: new Date() });

  const dateFormatter = (date: Date) => date.toLocaleDateString("en-US");

  const startDate = parseISO("2021-10-01");

  const ticks = Array.from(
    Array(differenceInMonths(new Date(), startDate) + 1)
  ).map((_, i) => addMonths(startDate, i));

  const orderedDaos = orderBy(
    DAOS,
    (dao) => parseFloat(joinedData[joinedData.length - 1][dao.name]),
    "desc"
  );

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={joinedData}
          margin={{
            top: 0,
            right: 75,
            left: 75,
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
          <YAxis tickFormatter={(value) => formatNumber(value)} />
          <Tooltip
            labelFormatter={dateFormatter}
            labelStyle={{ color: "black" }}
            formatter={(value) => {
              return formatNumber(Number(value));
            }}
          />
          <Legend />

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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
