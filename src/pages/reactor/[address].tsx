import { TAsset__factory, TokemakManager__factory } from "../../typechain";
import { getProvider } from "../../util";
import { GetStaticPaths, GetStaticProps } from "next";
import { BURN, T_TOKE_CONTRACT, TOKEMAK_MANAGER } from "../../constants";
import { prisma } from "../../util/db";
import { eachMonthOfInterval, parseISO } from "date-fns";
import { Block, Provider } from "@ethersproject/providers";
import { formatEther, getAddress } from "ethers/lib/utils";
import { sortBy } from "lodash";
import { useRouter } from "next/router";
import {
  Area,
  CartesianGrid,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { Box, Divider, HStack, Select } from "@chakra-ui/react";
import { FaRadiationAlt } from "react-icons/fa/index"; //Don't use all next.js doesn't like it
import { Page } from "../../components/Page";
import { LinkCard } from "../../components/LinkCard";
import { getHistoricalPrice, search } from "../../util/api/coinGecko";
import { BigNumber } from "bignumber.js";
import { formatNumber } from "../../util/maths";
import { Reactor } from "@prisma/client";

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
  });

  let formatter = Intl.NumberFormat("en", { notation: "compact" });

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
          domain={[
            () => ticks[0].getTime(),
            () => formattedEvents[formattedEvents.length - 1].date,
          ]}
          tickFormatter={dateFormatter}
          tickCount={5}
          // @ts-ignore
          ticks={ticks}
        />
        <YAxis
          tickFormatter={(tick) => {
            return formatter.format(tick.toFixed());
          }}
          unit="$"
        >
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
          tickFormatter={(tick) => {
            return formatter.format(tick);
          }}
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

  const lastBlock = await prisma.reactorValue.aggregate({
    _max: {
      blockNumber: true,
    },
    where: { contractAddress: address },
  });

  const contract = TAsset__factory.connect(address, provider);

  let newEvents = (
    await Promise.all([
      contract.queryFilter(
        contract.filters.Transfer(BURN),
        (lastBlock._max.blockNumber || 100000) + 1
      ),
      await contract.queryFilter(
        contract.filters.Transfer(undefined, BURN),
        (lastBlock._max.blockNumber || 100000) + 1
      ),
    ])
  )
    .flatMap((obj) => obj)
    .map(({ blockNumber, transactionHash, args: { to, from, value } }) => ({
      contractAddress: address,
      blockNumber,
      transactionHash,
      to,
      from,
      value: (to === BURN ? "-" : "") + value.toString(),
    }));

  if (newEvents.length > 0) {
    await prisma.reactorValue.createMany({ data: newEvents });
  }

  const rawEvents = await prisma.$queryRaw<
    {
      block_number: number;
      total: string;
    }[]
  >`select block_number, sum(value) over (order by block_number)::varchar as total
      from reactor_values
      where contract_address = ${address}
      order by block_number`;

  const currentBlock = await getCurrentBlock();

  let historicalPrices: Record<string, number> = { "1": 0 };

  if (reactor.isStablecoin) {
    historicalPrices = { "1": 1 };
  } else if (reactor.coingeckoId) {
    historicalPrices = await getHistoricalPrice(reactor.coingeckoId);
  }

  let days = Object.keys(historicalPrices);

  const events = rawEvents.map(({ total, block_number }) => {
    const date = estimateTime(currentBlock, block_number).getTime();
    total = formatEther(total);

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
  });

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

function estimateTime(
  currentBlock: Block,
  block: number,
  startBlock = 13331168,
  startTime = parseISO("2021-10-01T04:00:00.000Z")
) {
  const totalBlocks = startBlock - currentBlock.number;

  const totalMs = startTime.getTime() - currentBlock.timestamp * 1000;

  const msPerBlock = totalMs / totalBlocks;
  const blocksFromStart = block - startBlock;

  return new Date(
    Math.floor(blocksFromStart * msPerBlock) + startTime.getTime()
  );
}

async function getCurrentBlock() {
  const provider = getProvider();
  const currentBlockNumber = await provider.getBlockNumber();

  return provider.getBlock(currentBlockNumber);
}
