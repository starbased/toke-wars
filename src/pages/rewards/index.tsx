import { RewardsHash__factory } from "../../typechain";
import { useEffect, useState } from "react";

import { Badge } from "@chakra-ui/react";
import { GetStaticProps } from "next";
import { Page } from "../../components/Page";
import { UserInput } from "../../components/UserInput";
import { Totals } from "../../components/Totals";
import { getProvider } from "../../util";
import { REWARDS_CONTRACT } from "../../constants";
import { useRouter } from "next/router";
import { prisma } from "../../util/db";
import { CycleHash } from "@prisma/client";

type Props = {
  lastCycle: number;
  cycleHashes: CycleHash[];
};

export default function Rewards(props: Props) {
  const router = useRouter();

  const [address, setAddress] = useState("");

  useEffect(() => {
    setAddress(router.query.address?.toString() || "");
  }, [router.query.address]);

  return (
    <Page header="Rewards">
      <UserInput address={address} />
      {address !== "" ? (
        <Totals {...props} address={address} />
      ) : (
        <Badge>Enter an address to continue</Badge>
      )}
    </Page>
  );
}

function getAllCycles() {
  return prisma.cycleHash.findMany({
    orderBy: { cycle: "asc" },
  });
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const contract = RewardsHash__factory.connect(
    REWARDS_CONTRACT,
    getProvider()
  );

  const cycleHashes = await getAllCycles();

  const lastDbHash = cycleHashes[cycleHashes.length - 1];

  const lastCycle = (await contract.latestCycleIndex()).toNumber();

  if (!lastDbHash || lastDbHash.cycle !== lastCycle) {
    const cyclesToGet = Array(lastCycle - (lastDbHash?.cycle || 0))
      .fill(null)
      .map((_, i) => i + 1 + (lastDbHash?.cycle || 0));

    for (let cycle of cyclesToGet) {
      const hash = (await contract.cycleHashes(cycle)).cycle;
      await prisma.cycleHash.create({ data: { cycle, hash } });
    }
  }

  return {
    props: {
      lastCycle,
      cycleHashes: await getAllCycles(),
    },
  };
};
