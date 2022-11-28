import { useTokePrice } from "utils/api/tokemak";
import { Page } from "components/Page";
import { GetStaticProps } from "next";
import { prisma } from "utils/db";
import { TokeGraph } from "components/TokeGraph";
import { REACTORS } from "@/constants";
import { formatMoney, formatNumber } from "utils/maths";
import { CoinInfo, getGeckoData } from "utils/api/coinGecko";
import { DaosGraph } from "components/DaosGraph";
import { ResourcesCard } from "components/ResourcesCard";
import { getData, GraphRecord, groupByTokeType } from "@/queries";
import { StatCard } from "components/StatCard";

type Props = {
  data: {
    timestamp: number;
    toke?: number;
    tToke?: number;
    newStake?: number;
  }[];
  dao_data: ({
    timestamp: number;
  } & Record<string, number>)[];
  geckoData: CoinInfo;
};

export default function Home({ dao_data, data, geckoData }: Props) {
  const toke_price = useTokePrice();

  // count the number of daos that currently have a non-zero balance
  const daos_accumulating = Object.entries(
    dao_data[dao_data.length - 1]
  ).filter(([name, value]) => value !== 0 && name !== "timestamp").length;

  const { timestamp, ...lastValues } = data[data.length - 1];

  const total = Object.values(lastValues).reduce((a, b) => a + b);

  return (
    <Page header="Toke Wars Dashboard">
      <div className="grid md:grid-cols-3 gap-5">
        <StatCard
          top="Total DAO Owned TOKE"
          middle={formatNumber(total)}
          bottom={formatMoney(total * toke_price)}
        />
        <StatCard
          top="Circulating Supply"
          middle={formatNumber(geckoData?.market_data?.circulating_supply)}
          bottom={formatMoney(geckoData?.market_data?.market_cap?.usd)}
        />
        <StatCard
          top="DAOs Accumulating"
          middle={daos_accumulating}
          bottom={<>Total Reactors: {REACTORS.length}</>}
        />
      </div>

      <DaosGraph data={dao_data} />
      <TokeGraph data={data} />

      <ResourcesCard geckoData={geckoData} />
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const data = await groupByTokeType();

  const dao_records = await prisma.$queryRaw<GraphRecord[]>`
      select daos.name        as type,
             round(sum(adjusted_value) over (PARTITION BY daos.name order by block_number) / 10 ^ 18::numeric,
                   0)::integer as total,
             timestamp
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions_v dt on da.address = dt.account
               inner join blocks on block_number = number
      order by block_number
      `;

  const dao_data = await getData(dao_records);

  const geckoData = await getGeckoData("tokemak");

  return { props: { dao_data, data, geckoData }, revalidate: 60 * 5 };
};
