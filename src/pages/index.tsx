import { useTokePrice } from "../util/api/tokemak";
import { Page } from "../components/Page";
import { GetStaticProps } from "next";
import { prisma } from "../util/db";
import { TokeGraph } from "../components/TokeGraph";
import { DAOS, REACTORS } from "../constants";
import {
  Divider,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatNumber,
} from "@chakra-ui/react";
import { BaseCard } from "../components/DaoDetailsCard";
import { formatMoney, formatNumber } from "../util/maths";
import { CoinInfo, getGeckoData } from "../util/api/coinGecko";
import { DaosGraph } from "../components/DaosGraph";
import { ResourcesCard } from "../components/ResourcesCard";
import { getData, GraphRecord, groupByTokeType } from "../queries";

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
      <Divider />
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
