import { TAsset__factory, TokemakManager__factory } from "../../typechain";
import { getBlocks, getProvider } from "../../util";
import { GetStaticPaths, GetStaticProps } from "next";
import { BURN, T_TOKE_CONTRACT, TOKEMAK_MANAGER } from "../../constants";
import { prisma } from "../../util/db";
import { eachMonthOfInterval, isEqual, startOfDay } from "date-fns";
import { Provider } from "@ethersproject/providers";
import { getAddress } from "ethers/lib/utils";
import { isEmpty, sortBy } from "lodash";
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
import { getHistoricalPrice, search } from "../../util/api/coinGecko";
import { BigNumber } from "bignumber.js";
import { formatNumber } from "../../util/maths";
import { Reactor } from "@prisma/client";
import { TransferEvent } from "../../typechain/ERC20";

type Props = {
  reactors: Reactor[];
  symbol: string;
  address: string;
  events: Event[];
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

export default function Index({ address, events, reactors }: Props) {
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
      <Divider />
      {/*<ResourcesCard token={token} />*/}

      <div style={{ alignSelf: "flex-end", color: "gray" }}>
        Price data from{" "}
        <a href="https://www.coingecko.com" target="_blank" rel="noreferrer">
          CoinGecko
        </a>
      </div>
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const provider = getProvider();
  const contract = TokemakManager__factory.connect(TOKEMAK_MANAGER, provider);

  let pools = await contract.getPools();

  pools = pools.filter((pool) => pool !== T_TOKE_CONTRACT);

  const knownPools = await prisma.reactor.findMany({
    where: {
      address: { in: pools },
    },
  });

  const knownAddressSet = new Set(knownPools.map((pool) => pool.address));
  const unknownPools = pools.filter((pool) => !knownAddressSet.has(pool));

  for (let address of unknownPools) {
    await savePossibleReactor(address, provider);
  }

  return {
    paths: pools.map((address) => ({ params: { address } })),
    fallback: true,
  };
};

/**
 * Tries to save unknown tAsset to the database
 * Will set coingeckoId if there is a single match
 * @param address address of possible tAsset
 * @param provider
 */
async function savePossibleReactor(
  address: string,
  provider: Provider
): Promise<Reactor> {
  address = getAddress(address);
  if (address === T_TOKE_CONTRACT) {
    throw Error("won't save tToke asset to database");
  }
  const contract = TAsset__factory.connect(address, provider);
  const symbol = (await contract.symbol()).substring(1);

  let searchResults = await search(symbol);

  searchResults = searchResults.filter(
    (coin) => coin.symbol.toLowerCase() === symbol.toLowerCase()
  );

  let coingeckoId: string | null = null;

  if (searchResults.length === 1) {
    coingeckoId = searchResults[0].id;
  } else {
    console.warn(
      `found multiple possibilities for ${symbol}: ${searchResults.map(
        ({ name }) => name
      )}`
    );
  }
  const data = { symbol, address, coingeckoId, isStablecoin: false };
  await prisma.reactor.create({ data });
  return data;
}

export const getStaticProps: GetStaticProps<
  Props,
  { address: string }
> = async ({ params }) => {
  const provider = getProvider();
  let address = params?.address!;
  address = getAddress(address);

  const reactor =
    (await prisma.reactor.findUnique({ where: { address } })) ||
    (await savePossibleReactor(address, provider));

  if (!reactor.symbol) {
    throw Error("Unknown tAsset");
  }

  await updateReactor(address);

  const rawEvents = await prisma.$queryRaw<
    {
      timestamp: string;
      total: string;
    }[]
  >`
      select timestamp,
             round(sum(value) over (order by block_number) / 10 ^ 18::numeric, 0)::bigint as total
      from reactor_values
               inner join blocks on block_number = number
      where contract_address = ${address}
      order by block_number`;

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

  return {
    props: {
      address,
      symbol: reactor.symbol,
      events,
      reactors: await prisma.reactor.findMany(),
    },
    revalidate: 60 * 5,
  };
};

async function updateReactor(address: string) {
  const lastDBblock =
    (
      await prisma.reactorValue.aggregate({
        _max: {
          blockNumber: true,
        },
        where: { contractAddress: address },
      })
    )._max.blockNumber || 100000;

  const contract = TAsset__factory.connect(address, getProvider());

  const commonMap = ({
    blockNumber,
    transactionHash,
    args: { to, from },
  }: TransferEvent) => ({
    contractAddress: address,
    blockNumber,
    transactionHash,
    to,
    from,
  });

  const createdTokens = (
    await contract.queryFilter(contract.filters.Transfer(BURN), lastDBblock + 1)
  ).map((obj) => ({
    ...commonMap(obj),
    value: obj.args.value.toString(),
  }));

  const destroyedTokens = (
    await contract.queryFilter(
      contract.filters.Transfer(undefined, BURN),
      lastDBblock + 1
    )
  ).map((obj) => ({
    ...commonMap(obj),
    value: "-" + obj.args.value.toString(),
  }));

  const newEvents = [...createdTokens, ...destroyedTokens];

  if (!isEmpty(newEvents)) {
    await prisma.reactorValue.createMany({ data: newEvents });
  }

  await getBlocks(newEvents.map((obj) => obj.blockNumber));

  return newEvents;
}
