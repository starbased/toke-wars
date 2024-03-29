import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "utils/db";
import { toBuffer } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { transactionHash, logIndex } = z
    .object({ transactionHash: z.string(), logIndex: z.number() })
    .parse(JSON.parse(req.body));

  await prisma.revenueIgnoredTransaction.create({
    data: { transactionHash: toBuffer(transactionHash), logIndex },
  });

  res.status(200).json({});
}
