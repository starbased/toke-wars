import { TAsset__factory } from "@/typechain";
import { addressToHex, getAllReactors, getProvider, toBuffer } from "@/utils";
import { GetStaticPaths, GetStaticProps } from "next";
import { T_TOKE_CONTRACT } from "@/constants";
import { prisma } from "utils/db";
import {
  eachMonthOfInterval,
  getUnixTime,
  isEqual,
  startOfDay,
} from "date-fns";
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
import { faRadiationAlt } from "@fortawesome/free-solid-svg-icons";
import { Page } from "components/Page";
import { LinkCard } from "components/LinkCard";
import {
  CoinInfo,
  getGeckoData,
  getHistoricalPrice,
} from "utils/api/coinGecko";
import { BigNumber } from "bignumber.js";
import { formatNumber } from "utils/maths";
import { Reactor } from "@prisma/client";
import { ResourcesCard } from "components/ResourcesCard";
import { formatUnits } from "ethers/lib/utils";
import { Divider } from "components/Divider";
import Head from "next/head";
import { dateFormatter, tickFormatter } from "components/TokeGraph";

type Props = {
  reactors: (Omit<Reactor, "address"> & { address: string })[];
  symbol: string;
  address: string;
  events: Event[];
  holders: {
    total: number;
    account: string;
    named_account: string;
  }[];
  geckoData: CoinInfo | null;
  withheldLiquidity: string;
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
          right: 10,
          left: 20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          scale="time"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={tickFormatter}
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

export default function Index({
  address,
  events,
  reactors,
  geckoData,
  withheldLiquidity,
  holders,
}: Props) {
  const router = useRouter();

  if (!events) {
    return <div>loading</div>;
  }

  const totalHeld = holders.reduce((acc, { total }) => acc + total, 0);

  return (
    <Page header="Reactor Value Locked" className="items-center">
      <Head>
        <title>
          {`${
            reactors.find((reactor) => reactor.address === router.query.address)
              ?.symbol
          } Reactor`}
        </title>
        <meta
          name="description"
          content="View the history of deposits for Tokemak reactors"
        />
      </Head>
      <div className="flex flex-wrap gap-5">
        <select
          className="bg-gray-800 border-gray-600 border p-1  rounded-md"
          style={{ minWidth: "200px" }}
          placeholder="Select Token"
          name="token"
          value={address}
          onChange={(event) =>
            router.replace(`/reactors/${event.currentTarget.value}`)
          }
        >
          {sortBy(reactors, ({ symbol }) => symbol.toLowerCase()).map(
            ({ symbol, address }) => (
              <option value={address} key={address}>
                {symbol}
              </option>
            )
          )}
        </select>

        <LinkCard
          title="View on Tokemak.xyz"
          url={"https://tokemak.xyz/"}
          icon={faRadiationAlt}
        />
      </div>

      <div>
        {formatNumber(
          (parseFloat(withheldLiquidity) /
            parseInt(events[events.length - 1].total)) *
            100,
          2
        )}
        % ({formatNumber(parseFloat(withheldLiquidity), 2)}) Available for
        withdrawal
      </div>

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

      <div className="w-full overflow-x-auto">
        <h2>Top Holders</h2>
        <table className="styledTable">
          <thead>
            <tr>
              <th>Account</th>
              <th>Amount</th>
              <th>Percent</th>
            </tr>
          </thead>
          <tbody>
            {holders.slice(0, 10).map(({ named_account, account, total }) => (
              <tr key={account}>
                <td>{named_account || account.replace("\\", "0")}</td>
                <td>{formatNumber(total, 2)}</td>
                <td>{formatNumber((total / totalHeld) * 100, 2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {geckoData ? <ResourcesCard geckoData={geckoData} /> : null}
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  let reactors = await prisma.reactor.findMany();

  let pools = reactors.map(({ address }) =>
    addressToHex(address).toLowerCase()
  );

  if (process.env.FAST_BUILD) {
    pools = [pools[0]];
  }

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
    include: {
      geckoInfo: true,
    },
  });

  if (!reactor || !reactor.symbol) {
    throw Error("Unknown tAsset");
  }

  const contract = TAsset__factory.connect(address, getProvider());
  const decimals = await contract.decimals();

  const rawEvents = await prisma.$queryRaw<
    {
      timestamp: string;
      total: string;
    }[]
  >`
      select timestamp,
             round(sum(adjusted_value) over (order by block_number) / 10 ^ ${decimals}::numeric, 0)::integer as total
      from (select -amount as adjusted_value, *
            from erc20_deposit_v
            union all
            select amount as adjusted_value, *
            from erc20_withdrawals_v) erc20_transfers
               inner join blocks on block_number = number
      where address = ${toBuffer(address)}
        and account = '\\x0000000000000000000000000000000000000000'
        and topics @> array ['\\xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF'::bytea,'\\x0000000000000000000000000000000000000000000000000000000000000000'::bytea]
      order by number`;

  let historicalPrices: Record<string, number> = { "1": 0 };

  if (reactor.isStablecoin) {
    historicalPrices = { "1": 1 };
  } else if (reactor.coingeckoId) {
    historicalPrices = await getHistoricalPrice(
      reactor.coingeckoId,
      getUnixTime(new Date(rawEvents[0].timestamp).getTime())
    );
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

  const geckoData = (reactor.geckoInfo?.data as CoinInfo) || null;

  const reactors = (await prisma.reactor.findMany()).map((reactor) => ({
    ...reactor,
    address: addressToHex(reactor.address),
  }));

  const withheldLiquidity = formatUnits(
    await contract.withheldLiquidity(),
    decimals
  );

  return {
    props: {
      address,
      symbol: reactor.symbol,
      events,
      reactors,
      geckoData,
      withheldLiquidity,
      holders: await getHolders(address, decimals),
    },
    revalidate: 60 * 60,
  };
};

function getHolders(address: string, decimal: number) {
  return prisma.$queryRaw<
    {
      account: string;
      total: number;
      named_account: string;
    }[]
  >`
      select account::varchar,
             total,
             dao_name as named_account
      from (select account,
                   sum(adjusted_value) / 10^${decimal} as total
            from (select amount as adjusted_value, *
                  from erc20_deposit_v
                  union all
                  select -amount as adjusted_value, *
                  from erc20_withdrawals_v) foo
            where address = ${toBuffer(address)}
              and account != '\\x0000000000000000000000000000000000000000'
            group by account) totals
               left outer join dao_addresses da on da.address = totals.account
      where totals.total > 0
      order by total desc
  `;
}
