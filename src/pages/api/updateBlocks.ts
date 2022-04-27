// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { updateDbBlocks } from "../../util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const blocks = await updateDbBlocks();

  res.status(200).json({ newBlocks: blocks });
}
