import { GetStaticPaths, GetStaticProps } from "next";
import { prisma } from "utils/db";
import { Dao } from "@prisma/client";
import { Page } from "components/Page";
import { isEmpty } from "lodash";
import { TokeGraph } from "components/TokeGraph";
import { DaoDetailsCard } from "components/DaoDetailsCard";
import { addDays } from "date-fns";
import { ResourcesCard } from "components/ResourcesCard";
import { CoinInfo, getGeckoData } from "utils/api/coinGecko";
import { groupByTokeType } from "@/queries";
import axios from "axios";
import { addressToHex } from "@/utils";
import Head from "next/head";

type Props = {
  dao: Dao;
  addresses: string[];
  data: {
    timestamp: number;
    toke?: number;
    tToke?: number;
    newStake?: number;
  }[];
  geckoData: CoinInfo | null;
};

function getTotal(obj?: { timestamp: number } & Record<string, number>) {
  if (!obj) {
    return 0;
  }
  const { timestamp, ...lastValues } = obj;

  return Object.values(lastValues).reduce((a, b) => a + b);
}

export default function Index({ dao, data, addresses, geckoData }: Props) {
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
      <Head>
        <title>{dao.name} Toke Accumulation</title>
        <meta
          name="description"
          content={`Follow the Tokemak accumulation for ${dao.name}`}
        />
      </Head>
      <DaoDetailsCard
        stage={dao.stage}
        addresses={addresses}
        total={total}
        changePercent={changePercent}
      />
      <TokeGraph data={data} />
      {geckoData ? <ResourcesCard geckoData={geckoData} /> : null}
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

  const data = await groupByTokeType(name);

  const addresses = (
    await prisma.daoAddress.findMany({
      where: { daos: dao },
    })
  ).map(({ address }) => addressToHex(address));

  let geckoData = null;
  try {
    geckoData = await getGeckoData(dao.geckoId);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response?.status !== 404) {
        throw e;
      }
    }
  }

  return { props: { dao, data, addresses, geckoData }, revalidate: 60 * 5 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const daos = await prisma.dao.findMany();
  return {
    paths: daos.map((dao) => ({ params: { name: dao.name } })),
    fallback: false,
  };
};
