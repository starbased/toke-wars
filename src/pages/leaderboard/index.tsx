import { formatMoney, formatNumber } from "utils/maths";
import { GetStaticProps } from "next";
import Link from "next/link";
import { prisma } from "utils/db";
import { Dao } from "@prisma/client";
import { tokePrice, useTokePrice } from "utils/api/tokemak";
import { Coin } from "components/coin";
import { Card } from "components/Card";
import { Page } from "components/Page";
import Head from "next/head";

type Props = {
  toke_price: number;
  daos: {
    name: string;
    stage: number;
    coin: string;
    toke: number;
  }[];
};

export default function Leaderboard({
  toke_price: cachedTokePrice,
  daos,
}: Props) {
  const total = daos.reduce((acc, { toke }) => acc + toke, 0);

  const toke_price = useTokePrice(cachedTokePrice);

  return (
    <Page header="Leaderboard" className="items-center">
      <Head>
        <title>Leaderboard</title>
        <meta
          name="description"
          content="Track the Top DAOs accumulating Tokemak"
        />
      </Head>
      <Link href="/stages" passHref className="p-2 border border-gray-500 rounded-md">
        
          Discover the Stages of Liquidity
        
      </Link>

      <Card className="md:w-2/3 self-center overflow-x-auto w-full md:w-auto">
        <table className="styledTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stage</th>
              <th>TOKE Holdings</th>
              <th>USD Value</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {daos.map((dao) => (
              <tr key={dao.name}>
                <td>
                  <Coin coin={dao.coin}>{dao.name}</Coin>
                </td>
                <td>{dao.stage}</td>
                <td>{formatNumber(dao.toke)}</td>
                <td>{formatMoney(dao.toke * toke_price || 0)}</td>
                <td>{((dao.toke / total) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Name</th>
              <th>Stage</th>
              <th>TOKE Holdings</th>
              <th>USD Value</th>
              <th>%</th>
            </tr>
          </tfoot>
        </table>
      </Card>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const daos = await prisma.$queryRaw<(Dao & { toke: number })[]>`
    select daos.*, round((sum(dt.adjusted_value )/10^18)::numeric,2)::integer as toke 
    from daos
    inner join dao_addresses da on daos.name = da.dao_name
    inner join dao_transactions_v dt on da.address = dt.account
    group by daos.name
    order by toke desc
`;

  return {
    props: {
      toke_price: await tokePrice(),
      daos: daos,
    },
    revalidate: 60 * 5,
  };
};
