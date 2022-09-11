import { Page } from "components/Page";
import { UserInput } from "components/UserInput";
import Head from "next/head";

export default function Rewards() {
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
    </Page>
  );
}
