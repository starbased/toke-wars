import { provider } from "../util/providers";
import { useQuery } from "react-query";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { BigNumber as BN } from "bignumber.js";
import { TAsset__factory } from "../typechain";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import { useState } from "react";
import { Box, HStack, Select, Skeleton, Stack } from "@chakra-ui/react";
import { BURN, FIRST_BLOCK, REACTORS } from "../constants";
import { sortBy } from "lodash";
import { eachMonthOfInterval, isEqual } from "date-fns";
import { estimateDay, runningTotal } from "../api/utils";
import { Page } from "./Page";
import { LinkCard } from "./LinkCard";
import { FaRadiationAlt } from "react-icons/fa";
import { useHistoricalPrice } from "../api/coinGecko";
import { formatMoney, formatNumber } from "../util/maths";

function useReactorOverTime(address: string) {
  return useQuery(
    ["reactor", address],
    async () => {
      const contract = TAsset__factory.connect(address, provider);

      //TODO: add cache

      let events = await contract.queryFilter(
        contract.filters.Transfer(),
        FIRST_BLOCK
      );

      events = events.filter(
        ({ args: { from, to } }) => from === BURN || to === BURN
      );

      return events.map((event) => ({
        ...event,
        time: estimateDay(event.blockNumber),
      }));
    },
    {
      select: (events) =>
        runningTotal(
          events,
          ({ args: { from, value } }) =>
            (bn: BigNumber) =>
              from === BURN ? bn.add(value) : bn.sub(value)
          // keep the last event form each day
        ).filter(({ time }, i, array) => !isEqual(time, array[i + 1]?.time)),
    }
  );
}

export function Reactors() {
  const [address, setAddress] = useState(REACTORS[0][0]);

  const [, , token] = REACTORS.find(
    ([reactorAddress]) => address === reactorAddress
  );

  return (
    <Page header="Reactor Value Locked">
      <HStack spacing="24px">
        <Box w="220px">
          <Select
            placeholder="Select Token"
            name="token"
            value={address}
            onChange={(event) => setAddress(event.currentTarget.value)}
          >
            {sortBy(REACTORS, ([, name]) => name.toLowerCase()).map(
              ([address, name]) => (
                <option value={address} key={address}>
                  {name}
                </option>
              )
            )}
          </Select>
        </Box>
        <Box>
          <LinkCard
            title="View on Tokemak.xyz"
            url={"https://tokemak.xyz/"}
            icon={<FaRadiationAlt />}
          />
        </Box>
      </HStack>

      <div style={{ width: "100%", height: "400px" }}>
        <RvlGraph address={address} token={token} />
      </div>
      <div style={{ alignSelf: "flex-end", color: "gray" }}>
        Price data from{" "}
        <a href="https://www.coingecko.com" target="_blank">
          CoinGecko
        </a>
      </div>
    </Page>
  );
}

function RvlGraph({ address, token }: { address: string; token: string }) {
  const { data: reactorData } = useReactorOverTime(address);
  const { data: prices } = useHistoricalPrice(token);

  if (!prices || !reactorData) {
    return (
      <Stack>
        <Skeleton height="60px" />
        <Skeleton height="40px" />
        <Skeleton height="60px" />
        <Skeleton height="40px" />
        <Skeleton height="60px" />
        <Skeleton height="40px" />
      </Stack>
    );
  }

  //TODO: join to prices to make sure a value exists for every day
  let foo = Object.keys(prices);

  let formattedData = reactorData?.map(({ total, time }) => {
    const formattedTotal = formatEther(total);
    const value = new BN(formattedTotal)
      .times(
        prices[
          foo.find((s) => time.getTime() < parseInt(s)) || foo[foo.length - 1]
        ]
      )
      .toFixed(2);

    return {
      total: formattedTotal,
      time,
      value,
    };
  });

  const dateFormatter = (date: Date) => date.toLocaleDateString("en-US");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={formattedData}
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
          domain={[
            () => formattedData[0].time,
            () => formattedData[formattedData.length - 1].time,
          ]}
          tickFormatter={dateFormatter}
          tickCount={5}
          // @ts-ignore
          ticks={eachMonthOfInterval({
            start: formattedData[0].time,
            end: new Date(),
          })}
        />
        <YAxis
          domain={[
            () => 0,
            () =>
              Math.max(...formattedData.map(({ value }) => parseFloat(value))) *
              1.25,
          ]}
          tickFormatter={(tick) => {
            return formatMoney(tick.toFixed());
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[
            () => 0,
            () =>
              Math.max(...formattedData.map(({ total }) => parseFloat(total))) *
              1.25,
          ]}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip
          labelFormatter={dateFormatter}
          labelStyle={{ color: "black" }}
          formatter={(value) => formatNumber(value)}
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
        <Area
          connectNulls={true}
          dataKey="value"
          name="USD Value"
          // stroke="blue"
          // fill="#8884d8"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
