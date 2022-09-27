import { Page } from "components/Page";
import { UserInput } from "components/UserInput";
import Head from "next/head";
import { useLocalStorage } from "hooks/useLocalStorage";
import { getAddress } from "ethers/lib/utils";
import { useRouter } from "next/router";
import { divide } from "lodash";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function Rewards() {
  const [previousAddresses] = useLocalStorage<string[]>(
    "previousAddresses",
    []
  );

  return (
    <Page header="Rewards" className="items-center">
      <Head>
        <title>User Rewards</title>
        <meta
          name="description"
          content="Discover Tokemak rewards for a given Ethereum address"
        />
      </Head>
      <p>
        Enter an address to find out the total amount of Toke rewards earned
      </p>
      <UserInput />

      {previousAddresses ? (
        <div>
          <h2 className="text-xl">Previous Addresses</h2>
          {previousAddresses.map((address) => (
            <Row address={address} key={address} />
          ))}
        </div>
      ) : null}
    </Page>
  );
}

function Row({ address }: { address: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function onClick() {
    setLoading(true);
    router.push(`/rewards/${getAddress(address)}`, undefined);
  }

  return (
    <div className="cursor-pointer hover:underline" onClick={onClick}>
      {address}{" "}
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
      ) : null}
    </div>
  );
}
