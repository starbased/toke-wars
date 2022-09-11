import { useQuery } from "react-query";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

import { ManagerContract__factory } from "@/typechain";
import { providers } from "ethers";
import { TOKEMAK_MANAGER } from "@/constants";
import { StatCard } from "components/StatCard";

export function CycleInfo() {
  const { data } = useQuery("managerContract", async () => {
    const contract = ManagerContract__factory.connect(
      TOKEMAK_MANAGER,
      //TODO: move this call elsewhere
      new providers.InfuraProvider(1, process.env.NEXT_PUBLIC_INFURA_KEY)
    );

    const cycleIndex = (await contract.getCurrentCycleIndex()).toNumber();
    const nextCycle = new Date(
      (await contract.nextCycleStartTime()).toNumber() * 1000
    );

    return { cycleIndex, nextCycle };
  });

  const [nextCycle, setNextCycle] = useState("");
  useEffect(() => {
    function updateCycle() {
      if (data?.nextCycle) {
        setNextCycle(
          formatDistanceToNow(data.nextCycle, { includeSeconds: true })
        );
      }
    }
    updateCycle();
    let interval = setInterval(updateCycle, 1000 * 60);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <StatCard
      top="Current Cycle"
      middle={data?.cycleIndex}
      bottom={`Next Cycle in ${nextCycle}`}
    />
  );
}
