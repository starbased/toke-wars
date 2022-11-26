import Link from "next/link";
import { prisma } from "utils/db";
import type { Dao } from "@prisma/client";

import { Card } from "components/Card";
import { Page } from "components/Page";
import { Row } from "./row";
import { tokePrice } from "@/utils/api/tokemak";

export type Record = Dao & { toke: number };

export default async function Leaderboard() {
  const cachedTokePrice = await tokePrice();

  const daos = await prisma.$queryRaw<Record[]>`
    select daos.*, round((sum(dt.adjusted_value )/10^18)::numeric,2)::integer as toke 
    from daos
    inner join dao_addresses da on daos.name = da.dao_name
    inner join dao_transactions_v dt on da.address = dt.account
    group by daos.name
    order by toke desc
`;

  const total = daos.reduce((acc, { toke }) => acc + toke, 0);

  return (
    <Page header="Leaderboard" className="items-center">
      <Link
        href="/stages"
        passHref
        className="p-2 border border-gray-500 rounded-md"
      >
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
              <Row {...{ cachedTokePrice, dao, total }} key={dao.name} />
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
