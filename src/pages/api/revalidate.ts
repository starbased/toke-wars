import { prisma } from "../../utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { RewardsHash__factory } from "../../typechain";
import { getProvider } from "../../utils";
import { REWARDS_CONTRACT } from "../../constants";
import axios from "axios";
import { toBuffer } from "./updateEvents";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await res.revalidate("/emission");
  res.status(200).json({ done: true });
}
