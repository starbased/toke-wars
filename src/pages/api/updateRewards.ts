import { prisma } from "utils/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { RewardsHash__factory } from "@/typechain";
import { getProvider, toBuffer } from "@/utils";
import { REWARDS_CONTRACT } from "@/constants";
import axios from "axios";

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
    )._max.cycle || -1;

  const latestCycleIndex = await contract.latestCycleIndex();

  const cyclesLoaded = [];

  for (
    let cycle = lastDbCycle + 1;
    cycle <= latestCycleIndex.toNumber();
    cycle++
  ) {
    const cycleHash = (await contract.cycleHashes(cycle)).cycle;

    let { data: responseData } = await axios.get<
      {
        payload: { wallet: string; amount: string };
        summary?: { cycleTotal: string; breakdown: { amount: string }[] };
      }[]
    >(
      `${
        process.env.NEXT_PUBLIC_IPFS_PORTAL || "https://ipfs.tokemaklabs.xyz"
      }/ipfs/${cycleHash}/all.json`
    );

    const data = responseData
      .filter(
        (obj) =>
          obj.summary === undefined || parseInt(obj.summary.cycleTotal) > 0
      )
      .map((obj) => {
        const address = toBuffer(obj.payload.wallet);
        return {
          address,
          cycle,
          amount: obj.payload.amount,
          cycleTotal: obj.summary?.cycleTotal || "0",
          data:
            obj.summary?.breakdown?.filter((obj) => obj.amount !== "0") || [],
        };
      });

    await prisma.ipfsReward.createMany({ data, skipDuplicates: true });
    console.log(`Added cycle ${cycle}`);
    cyclesLoaded.push(cycle);
  }

  if (cyclesLoaded.length !== 0) {
    await res.revalidate("/emissions");
  }

  res.status(200).json({ cyclesLoaded, done: true });
}
