import { prisma } from "../../util/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { RewardsHash__factory } from "../../typechain";
import { getProvider } from "../../util";
import { REWARDS_CONTRACT } from "../../constants";
import axios from "axios";
import { toBuffer } from "./updateEvents";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const contract = RewardsHash__factory.connect(
    REWARDS_CONTRACT,
    getProvider()
  );

  const lastDbCycle =
    (
      await prisma.ipfsReward.aggregate({
        _max: { cycle: true },
      })
    )._max.cycle || 200;

  const latestCycleIndex = await contract.latestCycleIndex();

  const cyclesLoaded = [];

  for (
    let cycle = lastDbCycle + 1;
    cycle <= latestCycleIndex.toNumber();
    cycle++
  ) {
    const cycleHash = (await contract.cycleHashes(cycle)).latestClaimable;

    let { data: responseData } = await axios.get<
      { payload: { wallet: string }; summary: { cycleTotal: string } }[]
    >(`https://ipfs.tokemaklabs.xyz/ipfs/${cycleHash}/all.json`);

    const data = responseData
      .filter((obj) => parseInt(obj.summary.cycleTotal) > 0)
      .map((obj) => {
        const address = toBuffer(obj.payload.wallet);
        return { address, cycle, data: obj };
      });

    await prisma.ipfsReward.createMany({ data, skipDuplicates: true });
    cyclesLoaded.push(cycle);
  }
  await res.revalidate("/emissions");
  res.status(200).json({ cyclesLoaded, done: true });
}
