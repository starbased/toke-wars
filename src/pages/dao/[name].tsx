import { GetStaticPaths, GetStaticProps } from "next";
import { prisma } from "../../util/db";
import { Dao } from "@prisma/client";
import { Page } from "../../components/Page";
import { isEmpty } from "lodash";
import { TokeGraph } from "../../components/TokeGraph";
import { DaoDetailsCard } from "../../components/DaoDetailsCard";
import { Divider } from "@chakra-ui/react";
import { getData } from "../index";
import { updateAll } from "../../tokeTokenAmounts";
import { addDays } from "date-fns";
import { ResourcesCard } from "../../components/ResourcesCard";
import { CoinInfo, getGeckoData } from "../../util/api/coinGecko";

type Props = {
  dao: Dao;
  address: string;
  data: {
    timestamp: number;
    toke?: number;
    tToke?: number;
    newStake?: number;
  }[];
  geckoData: CoinInfo;
};

type LocalRecord = {
  type: string;
  timestamp: number;
  total: number;
};

function getTotal(obj?: { timestamp: number } & Record<string, number>) {
  if (!obj) {
    return 0;
  }
  const { timestamp, ...lastValues } = obj;

  return Object.values(lastValues).reduce((a, b) => a + b);
}

export default function Index({ dao, data, address, geckoData }: Props) {
  if (isEmpty(data)) {
    return <div>Nothing here</div>;
  }

  const total = getTotal(data[data.length - 1]);

  const daysAgo = addDays(new Date(), -30).getTime();

  const pastTotal = getTotal(
    [...data].reverse().find((event) => event.timestamp < daysAgo)
  );

  const changePercent = (total / pastTotal - 1) * 100;

  return (
    <Page header={dao.name}>
      <DaoDetailsCard
        stage={dao.stage}
        address={address}
        total={total}
        changePercent={changePercent}
      />
      <TokeGraph data={data} />
      <Divider />
      <ResourcesCard geckoData={geckoData} />
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props, { name: string }> = async ({
  params,
}) => {
  await updateAll();

  const name = params!.name;

  const dao = await prisma.dao.findUnique({
    where: { name },
    rejectOnNotFound: true,
  });

  const records = await prisma.$queryRaw<LocalRecord[]>`
      select type,
             timestamp,
             round(sum(value) over (PARTITION BY type order by block_number) / 10 ^ 18::numeric, 0)::bigint as total
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions dt on da.address = dt.dao_address
               inner join blocks on block_number = number
      where name = ${name}
      order by block_number
`;

  const data = await getData(records);

  const address = (
    await prisma.daoAddress.findFirst({
      where: { daos: dao },
      rejectOnNotFound: true,
    })
  ).address;

  const geckoData = await getGeckoData(dao.geckoId);

  return { props: { dao, data, address, geckoData }, revalidate: 60 * 5 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const daos = await prisma.dao.findMany();
  return {
    paths: daos.map((dao) => ({ params: { name: dao.name } })),
    fallback: false,
  };
};
