import { prisma } from "../../../util/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { RewardsHash__factory } from "../../../typechain";
import { getProvider } from "../../../util";
import { REWARDS_CONTRACT } from "../../../constants";
import axios from "axios";
import { toBuffer } from "../updateEvents";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cycle = parseInt(req.query.cycle.toString());

  const cycleExists = (await prisma.ipfsReward.count({ where: { cycle } })) > 0;

  if (cycleExists) {
    res.status(200).json({ done: true });
  }

  const contract = RewardsHash__factory.connect(
    REWARDS_CONTRACT,
    getProvider()
  );

  const cycleHash = (await contract.cycleHashes(cycle)).latestClaimable;

  if (cycleHash === "") {
    return res.status(400).end();
  }

  let { data: responseData } = await axios.get<
    { payload: { wallet: string }; summary: { cycleTotal: string } }[]
  >(`https://ipfs.tokemaklabs.xyz/ipfs/${cycleHash}/all.json`);

  const data = responseData
    .filter((obj) => parseInt(obj.summary.cycleTotal) > 0)
    .map((obj) => {
      const address = toBuffer(obj.payload.wallet);
      return { address, cycle, data: obj };
    });

  await prisma.ipfsReward.createMany({ data });

  res.status(200).json({ cycle, done: true });
}
