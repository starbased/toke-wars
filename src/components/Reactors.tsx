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
import { Box, Center, chakra, Select, VStack } from "@chakra-ui/react";
import { BURN, FIRST_BLOCK, REACTORS } from "../constants";
import { sortBy } from "lodash";
import axios from "axios";
import { addDays, eachMonthOfInterval, getUnixTime, isEqual } from "date-fns";
import { estimateDay, runningTotal } from "../api/utils";

function useHistoricalPrice(coin?: string) {
  return useQuery(
    ["price", coin],
    async () => {
      const { data } = await axios.get<{ prices: [number, number][] }>(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range`,
        {
          params: {
            vs_currency: "usd",
            //has to be at least 90 days to get in a daily scale
            //TODO: make sure to go back far enough fetch transactions first
            from: getUnixTime(addDays(new Date(), -91)),
            to: getUnixTime(new Date()),
          },
        }
      );
      return data;
    },
    {
      enabled: !!coin,
      select(data) {
        return data.prices.reduce<Record<number, number>>(
          (acc, [time, price]) => ({ ...acc, [time]: price }),
          {}
        );
      },
    }
  );
}

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
    <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <chakra.h1 textAlign="center" fontSize="4xl" pb={8} fontWeight="bold">
        Reactor Value Locked
      </chakra.h1>
      <VStack spacing={10} align="stretch">
        <Center>
          <Box w="250px">
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
        </Center>

        <Center>
          <div style={{ width: "1000px", height: "400px" }}>
            <RvlGraph address={address} token={token} />
          </div>
        </Center>
      </VStack>
    </Box>
  );
}

function RvlGraph({ address, token }: { address: string; token: string }) {
  const { data: reactorData } = useReactorOverTime(address);
  const { data: prices } = useHistoricalPrice(token);

  if (!prices || !reactorData) {
    return <div>loading</div>;
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
        />
        <Tooltip
          labelFormatter={dateFormatter}
          labelStyle={{ color: "black" }}
        />
        <Legend />
        <Line
          connectNulls={true}
          dataKey="total"
          stroke="#8884d8"
          yAxisId="right"
          dot={false}
        />
        <Area
          connectNulls={true}
          dataKey="value"
          // stroke="blue"
          // fill="#8884d8"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
