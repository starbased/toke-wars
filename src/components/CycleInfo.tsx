import { useQuery } from "react-query";
import { Stat, StatHelpText, StatNumber } from "@chakra-ui/react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { BaseCard } from "./DaoDetailsCard";
import { ManagerContract__factory } from "../typechain";
import { providers } from "ethers";
import { TOKEMAK_MANAGER } from "../constants";

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
      setNextCycle(
        // @ts-ignore
        formatDistanceToNow(data.nextCycle, { includeSeconds: true })
      );
    }
    if (data) {
      updateCycle();
    }
    const interval = setInterval(updateCycle, 1000 * 60);
    return () => clearInterval(interval);
  }, [data]);

  return (
    <BaseCard title="Current Cycle">
      <Stat>
        <StatNumber>{data?.cycleIndex}</StatNumber>
        {/* calc days until next cycle */}
        <StatHelpText>Next Cycle in {nextCycle}</StatHelpText>
      </Stat>
    </BaseCard>
  );
}
