import { PropsWithChildren } from "react";
import { Page } from "components/Page";
import { LinkCard } from "components/LinkCard";
import { faRadiationAlt } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "utils/db";
import { addressToHex } from "@/utils";
import { Selector } from "./selector";

export default async function Layout({
  children,
  params: { address },
}: PropsWithChildren<{ params: { address: string } }>) {
  const reactors = (
    await prisma.reactor.findMany({ orderBy: { symbol: "asc" } })
  ).map((reactor) => ({
    ...reactor,
    address: addressToHex(reactor.address),
  }));

  return (
    <Page header="Reactor Value Locked" className="items-center">
      <div className="flex flex-wrap gap-5">
        <Selector reactors={reactors} address={address} />

        <LinkCard
          title="View on Tokemak.xyz"
          url={"https://tokemak.xyz/"}
          icon={faRadiationAlt}
        />
      </div>
      {children}
    </Page>
  );
}
