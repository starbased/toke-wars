import { useTokePrice } from "../util/api/tokemak";
import { Page } from "../components/Page";
import { GetStaticProps } from "next";
import { prisma } from "../util/db";
import { isEqual } from "date-fns";
import { TokeGraph } from "../components/TokeGraph";
import { DAOS, REACTORS } from "../constants";
import { SimpleGrid, Stat, StatHelpText, StatNumber } from "@chakra-ui/react";
import { BaseCard } from "../components/DaoDetailsCard";
import { formatMoney, formatNumber } from "../util/maths";
import { CoinInfo, getGeckoData } from "../util/api/coinGecko";
import { DaosGraph } from "../components/DaosGraph";
import { updateAll } from "../tokeTokenAmounts";

type Props = {
  data: {
    timestamp: number;
    toke?: number;
    tToke?: number;
    newStake?: number;
  }[];
  dao_data: {
    timestamp: number;
  }[];
  geckoData: CoinInfo;
};

type Record = {
  type: string;
  total: number;
  timestamp: number;
};

export default function Home({ dao_data, data, geckoData }: Props) {
  const toke_price = useTokePrice();

  const { timestamp, ...lastValues } = data[data.length - 1];

  const total = Object.values(lastValues).reduce((a, b) => a + b);

  return (
    <Page header="Toke Wars Dashboard">
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={{ base: 5, lg: 8 }}
        style={{ alignSelf: "stretch" }}
        px={5}
      >
        <BaseCard title="Total DAO Owned TOKE">
          <Stat>
            <StatNumber>{formatNumber(total)}</StatNumber>
            <StatHelpText>{formatMoney(total * toke_price)}</StatHelpText>
          </Stat>
        </BaseCard>

        <BaseCard title="Circulating Supply">
          <Stat>
            <StatNumber>
              {formatNumber(geckoData?.market_data?.circulating_supply)}
            </StatNumber>
            <StatHelpText>
              {formatMoney(geckoData?.market_data?.market_cap?.usd)}
            </StatHelpText>
          </Stat>
        </BaseCard>

        <BaseCard title="DAOs Accumulating">
          <Stat>
            <StatNumber>{DAOS.length}</StatNumber>
            <StatHelpText>Total Reactors: {REACTORS.length}</StatHelpText>
          </Stat>
        </BaseCard>
      </SimpleGrid>
      <DaosGraph data={dao_data} />
      <TokeGraph data={data} />
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  await updateAll();

  const records = await prisma.$queryRaw<Record[]>`
      select type,
             round(sum(value) over (PARTITION BY type order by block_number) / 10 ^ 18::numeric, 0)::bigint as total,
             timestamp
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions dt on da.address = dt.dao_address
               inner join blocks on block_number = number
      order by block_number
  `;
  const data = await getData(records);

  const dao_records = await prisma.$queryRaw<Record[]>`
      select name as type,
             round(sum(value) over (PARTITION BY name order by block_number) / 10 ^ 18::numeric, 0)::bigint as total,
             timestamp
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions dt on da.address = dt.dao_address
               inner join blocks on block_number = number
      order by block_number
      `;

  const dao_data = await getData(dao_records);

  const geckoData = await getGeckoData("tokemak");

  return { props: { dao_data, data, geckoData }, revalidate: 60 * 5 };
};

export async function getData(records: Record[]) {
  let previous = { timestamp: new Date(records[0].timestamp).getTime() };
  return records
    .map<{
      timestamp: number;
    }>(({ type, total, timestamp }) => ({
      [type]: total,
      timestamp: new Date(timestamp).getTime(),
    }))
    .map((current) => {
      const out = { ...previous, ...current };
      return (previous = out);
    })
    .filter(
      ({ timestamp }, i, array) => !isEqual(timestamp, array[i + 1]?.timestamp)
    );
}
