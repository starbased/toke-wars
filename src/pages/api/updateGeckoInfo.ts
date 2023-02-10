import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "utils/db";
import { getGeckoData } from "utils/api/coinGecko";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  let ids: string[] = [];

  if (id) {
    if (!Array.isArray(id)) {
      ids = [id];
    } else {
      ids = id;
    }
  }

  for (let id of ids) {
    const data = await getGeckoData(id);

    await prisma.geckoInfo.upsert({
      where: { id },
      update: {
        data,
      },
      create: {
        id,
        data,
      },
    });
  }

  res.status(200).json(ids);
}
