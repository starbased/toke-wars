import { ManagerContract__factory, TAsset__factory } from "../../typechain";
import { getProvider } from "../../util";
import { GetStaticPaths, GetStaticProps } from "next";
import { T_TOKE_CONTRACT, TOKEMAK_MANAGER } from "../../constants";
import { prisma } from "../../util/db";
import { eachMonthOfInterval, isEqual, startOfDay } from "date-fns";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
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
import { Box, Divider, HStack, Select } from "@chakra-ui/react";
import { FaRadiationAlt } from "react-icons/fa/index"; //Don't use all next.js doesn't like it
import { Page } from "../../components/Page";
import { LinkCard } from "../../components/LinkCard";
import {
  CoinInfo,
  getGeckoData,
  getHistoricalPrice,
} from "../../util/api/coinGecko";
import { BigNumber } from "bignumber.js";
import { formatNumber } from "../../util/maths";
import { Reactor } from "@prisma/client";
import { ResourcesCard } from "../../components/ResourcesCard";
import { toBuffer } from "../api/updateEvents";

type Props = {
  reactors: (Omit<Reactor, "address"> & { address: string })[];
  symbol: string;
  address: string;
  events: Event[];
  geckoData: CoinInfo | null;
};

type Event = {
  date: number;
  total: string;
  value: string;
};

function Graph({ events }: { events: Event[] }) {
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
          right: 75,
          left: 75,
          bottom: 5,
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

export default function Index({ address, events, reactors, geckoData }: Props) {
  const router = useRouter();

  if (!events) {
    return <div>loading</div>;
  }

  return (
    <Page header="Reactor Value Locked">
      <HStack spacing="24px">
        <Box w="220px">
          <Select
            placeholder="Select Token"
            name="token"
            value={address}
            onChange={(event) =>
              router.replace(`/reactor/${event.currentTarget.value}`)
            }
          >
            {sortBy(reactors, ({ symbol }) => symbol.toLowerCase()).map(
              ({ symbol, address }) => (
                <option value={address} key={address}>
                  {symbol}
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
        <Graph events={events} />
      </div>
      <div style={{ alignSelf: "flex-end", color: "gray" }}>
        Price data from{" "}
        <a href="https://www.coingecko.com" target="_blank" rel="noreferrer">
          CoinGecko
        </a>
      </div>
      <Divider />
      {geckoData ? <ResourcesCard geckoData={geckoData} /> : null}
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const provider = getProvider();
  const contract = ManagerContract__factory.connect(TOKEMAK_MANAGER, provider);

  let pools = await contract.getPools();

  pools = pools
    .filter((pool) => pool !== T_TOKE_CONTRACT)
    .map((pool) => pool.toLowerCase());

  return {
    paths: pools.map((address) => ({ params: { address } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  Props,
  { address: string }
> = async ({ params }) => {
  let address = params?.address!;
  address = address.toLowerCase();

  const reactor = await prisma.reactor.findUnique({
    where: { address: toBuffer(address) },
  });

  if (!reactor || !reactor.symbol) {
    throw Error("Unknown tAsset");
  }

  const contract = TAsset__factory.connect(address, getProvider());

  const rawEvents = await prisma.$queryRaw<
    {
      timestamp: string;
      total: string;
    }[]
  >`
      select timestamp,
             round(sum(adjusted_value) over (order by block_number) / 10 ^ ${await contract.decimals()}::numeric, 0)::integer as total
      from (
               select "transactionHash" as transaction_hash,
                      "blockNumber"     as block_number,
                      address,
                      "to"              as account,
                      value   * -1          as adjusted_value
               from erc20_transfers
               union all
               select "transactionHash", "blockNumber", address, "from" as account,  value
               from erc20_transfers
           )erc20_transfers
               inner join blocks on block_number = number
      where address = ${toBuffer(address)}
        and account = '\\x0000000000000000000000000000000000000000'
      order by number`;

  let historicalPrices: Record<string, number> = { "1": 0 };

  if (reactor.isStablecoin) {
    historicalPrices = { "1": 1 };
  } else if (reactor.coingeckoId) {
    historicalPrices = await getHistoricalPrice(reactor.coingeckoId);
  }

  let days = Object.keys(historicalPrices);

  const events = rawEvents
    .map(({ total, timestamp }) => {
      const date = new Date(timestamp).getTime();

      const value = new BigNumber(total)
        .times(
          historicalPrices[
            days.find((s) => date < parseInt(s)) || days[days.length - 1]
          ]
        )
        .toString();

      return {
        total,
        date,
        value,
      };
    })
    .filter(
      ({ date }, i, array) =>
        !isEqual(startOfDay(date), startOfDay(array[i + 1]?.date))
    );

  const geckoData = reactor.coingeckoId
    ? await getGeckoData(reactor.coingeckoId)
    : null;

  const reactors = (await prisma.reactor.findMany()).map((reactor) => ({
    ...reactor,
    address: "0x" + reactor.address.toString("hex"),
  }));

  return {
    props: {
      address,
      symbol: reactor.symbol,
      events,
      reactors,
      geckoData,
    },
    revalidate: 60 * 5,
  };
};
