import { provider } from "../util/providers";
import { useQuery } from "react-query";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { TAsset__factory } from "../typechain";
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
import { useState } from "react";
import { Box, Center, chakra, Select, Stack, VStack } from "@chakra-ui/react";

function runningTotal<T>(
  events: Iterable<T>,
  getValue: (t: T) => (n: BigNumber) => BigNumber
) {
  const output: { event: T; total: BigNumber }[] = [];

  let total = BigNumber.from(0);

  for (let event of events) {
    total = getValue(event)(total);

    output.push({
      total: total,
      event,
    });
  }

  return output;
}

/* CoinGecko Pricing API:
https://www.coingecko.com/en/api/documentation

usage: GET a CSV of token IDs (found on token page, also added to below array)

e.g.

curl -X 'GET' \
'https://api.coingecko.com/api/v3/simple/price?ids=alchemix%2Colympus%2Cfox&vs_currencies=usd' \
-H 'accept: application/json' 

response:

{
  "alchemix": {
    "usd": 95.23
  },
  "fox": {
    "usd": 0.00001466
  },
  "olympus": {
    "usd": 30.08
  }
}

*/

export function Reactors() {
  const addresses = [
    ["0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84", "ALCX", "alchemix"],
    ["0xe7a7D17e2177f66D035d9D50A7f48d8D8E31532D", "OHM", "olympus"],
    ["0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36", "WETH", "weth"],
    ["0x15A629f0665A3Eb97D7aE9A7ce7ABF73AeB79415", "TCR", "tracer-dao"],
    ["0xf49764c9C5d644ece6aE2d18Ffd9F1E902629777", "SUSHI", "sushi"],
    ["0xADF15Ec41689fc5b6DcA0db7c53c9bFE7981E655", "FXS", "frax-share"],
    [
      "0x808D3E6b23516967ceAE4f17a5F9038383ED5311",
      "FOX",
      "shapeshift-fox-token",
    ],
    ["0xDc0b02849Bb8E0F126a216A2840275Da829709B0", "APW", "apwine"],
    ["0x94671A3ceE8C7A12Ea72602978D1Bb84E920eFB2", "FRAX", "frax"],
    ["0x0CE34F4c26bA69158BC2eB8Bf513221e44FDfB75", "DAI", "dai"],
    ["0x9eEe9eE0CBD35014e12E1283d9388a40f69797A3", "LUSD", "liquity-usd"],
    ["0x482258099De8De2d0bda84215864800EA7e6B03D", "UST", "terrausd-wormhole"],
    ["0x03DccCd17CC36eE61f9004BCfD7a85F58B2D360D", "FEI", "fei-usd"],
    ["0xeff721Eae19885e17f5B80187d6527aad3fFc8DE", "SNX", "havven"],
    [
      "0x2e9F9bECF5229379825D0D3C1299759943BD4fED",
      "MIM",
      "magic-internet-money",
    ],
    ["0x7211508D283353e77b9A7ed2f22334C219AD4b4C", "alUSD", "alchemix-usd"],
    ["0x2Fc6e9c1b2C07E18632eFE51879415a580AD22E1", "GAMMA", "gamma-strategies"],
    ["0x41f6a95Bacf9bC43704c4A4902BA5473A8B00263", "gOHM", "governance-ohm"],
  ];

  const [address, setAddress] = useState(
    "0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84"
  );

  const burn = "0x0000000000000000000000000000000000000000";

  const { data } = useQuery(
    ["reactor", address],
    async () => {
      const contract = TAsset__factory.connect(address, provider);

      let events = await contract.queryFilter(contract.filters.Transfer());

      events = events.filter(
        ({ args: { from, to } }) => from === burn || to === burn
      );

      return events;
    },
    {
      select: (events) =>
        runningTotal(
          events,
          ({ args: { from, value } }) =>
            (bn: BigNumber) =>
              from === burn ? bn.add(value) : bn.sub(value)
        ),
    }
  );

  let formattedData = data?.map(({ total, event: { blockNumber } }) => ({
    total: formatEther(total),
    blockNumber,
  }));

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
              {addresses.map(([address, name]) => (
                <option value={address} key={address}>
                  {name}
                </option>
              ))}
            </Select>
          </Box>
        </Center>
        <Center>
          <div style={{ width: "1000px", height: "400px" }}>
            {formattedData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
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
                    dataKey="blockNumber"
                    // scale="time"
                    type="number"
                    // tickFormatter={dateFormatter}
                    domain={[
                      () => formattedData[0]?.blockNumber,
                      () =>
                        formattedData[formattedData.length - 1]?.blockNumber,
                    ]}
                    // @ts-ignore
                    // ticks={ticks}
                  />
                  <YAxis />
                  <Tooltip
                    // labelFormatter={dateFormatter}
                    labelStyle={{ color: "black" }}
                  />
                  <Legend />
                  <Area
                    connectNulls={true}
                    type="stepAfter"
                    dataKey="total"
                    stroke="#8884d8"
                    fill="#8884d8"
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </Center>
      </VStack>
    </Box>
  );
}
