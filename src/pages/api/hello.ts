// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../util/db";
import { getBlocks } from "../../util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const blocks = await prisma.$queryRaw<{ block_number: number }[]>`
    select distinct a.block_number from (select block_number
    from dao_transactions
union all 
select block_number
from reactor_values) a
order by block_number
  `;

  const foo = await getBlocks(blocks.map((obj) => obj.block_number));

  res.status(200).json({ name: foo });
}
