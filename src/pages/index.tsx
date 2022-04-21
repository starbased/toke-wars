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
import { CoinInfo, useGeckoData } from "../util/api/coinGecko";
import { DaosGraph } from "../components/DaosGraph";

type Props = {
  data: {
    block_number: number;
    toke?: number;
    tToke?: number;
    newStake?: number;
  }[];
  dao_data: {
    block_number: number;
  }[];
  geckoData: CoinInfo;
};

type Record = {
  type: string;
  block_number: number;
  total: number;
};

export default function Home({ dao_data, data, geckoData }: Props) {
  const toke_price = useTokePrice();

  const { block_number, ...lastValues } = data[data.length - 1];

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
  const records = await prisma.$queryRaw<Record[]>`
      select type,
             block_number,
             round(sum(value) over (PARTITION BY type order by block_number) / 10 ^ 18::numeric, 0)::bigint as total
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions dt on da.address = dt.dao_address
      order by block_number
  `;
  const data = await getData(records);

  const dao_records = await prisma.$queryRaw<Record[]>`
      select name as type,
             block_number,
             round(sum(value) over (PARTITION BY name order by block_number) / 10 ^ 18::numeric, 0)::bigint as total
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions dt on da.address = dt.dao_address
      order by block_number
      `;

  const dao_data = await getData(dao_records);

  const geckoData = await useGeckoData("tokemak");

  return { props: { dao_data, data, geckoData }, revalidate: 60 * 5 };
};

export async function getData(records: Record[]) {
  let previous = { block_number: records[0].block_number };
  return records
    .map<{
      block_number: number;
    }>(({ type, total, block_number }) => ({
      [type]: total,
      block_number,
    }))
    .map((current) => {
      const out = { ...previous, ...current };
      return (previous = out);
    })
    .filter(
      ({ block_number }, i, array) =>
        !isEqual(block_number, array[i + 1]?.block_number)
    );
}
