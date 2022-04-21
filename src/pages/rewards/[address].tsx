import { RewardsHash__factory } from "../../typechain";
import { useQuery } from "react-query";
import { Page } from "../../components/Page";
import { getProvider } from "../../util";
import { useRouter } from "next/router";
import { REWARDS_CONTRACT } from "../../constants";
import { Totals } from "../../components/Totals";
import { UserInput } from "../../components/UserInput";

export default function Index() {
  const router = useRouter();
  const address = router.query.address?.toString();

  const { data: latestCycle } = useQuery(
    "lastCycle",
    () => {
      const contract = RewardsHash__factory.connect(
        REWARDS_CONTRACT,
        getProvider()
      );

      return contract.latestCycleIndex();
    },
    { staleTime: 1000 * 60 * 60, select: (data) => data.toNumber() } // 1 hour
  );

  return (
    <Page header="Index">
      <UserInput address={address} />
      {!latestCycle || !address ? (
        <div>Loading</div>
      ) : (
        <Totals latestCycle={latestCycle} address={address} />
      )}
    </Page>
  );
}
