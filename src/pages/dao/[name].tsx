import { GetStaticPaths, GetStaticProps } from "next";
import { prisma } from "../../util/db";
import { Dao } from "@prisma/client";
import { Page } from "../../components/Page";
import { isEmpty } from "lodash";
import { isEqual } from "date-fns";
import { TokeGraph } from "../../components/TokeGraph";
import { DaoDetailsCard } from "../../components/DaoDetailsCard";
import { Divider } from "@chakra-ui/react";
import { getData } from "../index";

type Props = {
  dao: Dao;
  address: string;
  data: {
    block_number: number;
    toke?: number;
    tToke?: number;
    newStake?: number;
  }[];
};

type Record = {
  type: string;
  block_number: number;
  total: number;
};

export default function Index({ dao, data, address }: Props) {
  if (isEmpty(data)) {
    return <div>Nothing here</div>;
  }

  const { block_number, ...lastValues } = data[data.length - 1];

  const total = Object.values(lastValues).reduce((a, b) => a + b);

  return (
    <Page header={dao.name}>
      <DaoDetailsCard
        stage={dao.stage}
        address={address}
        total={total}
        changePercent={1}
      />
      <Divider />
      {/*<ResourcesCard token={dao.coingecko} />*/}
      <TokeGraph data={data} />
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props, { name: string }> = async ({
  params,
}) => {
  const name = params!.name;

  const dao = await prisma.dao.findUnique({
    where: { name },
    rejectOnNotFound: true,
  });

  const records = await prisma.$queryRaw<Record[]>`
      select type,
             block_number,
             round(sum(value) over (PARTITION BY type order by block_number) / 10 ^ 18::numeric, 0)::bigint as total
      from daos
               inner join dao_addresses da on daos.name = da.dao_name
               inner join dao_transactions dt on da.address = dt.dao_address
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

  return { props: { dao, data, address }, revalidate: 60 * 5 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const daos = await prisma.dao.findMany();
  return {
    paths: daos.map((dao) => ({ params: { name: dao.name } })),
    fallback: false,
  };
};
