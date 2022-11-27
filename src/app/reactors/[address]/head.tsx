import DefaultHead from "@/components/DefaultHead";
import { getReactor, PageProps } from "@/app/reactors/[address]/page";

export default async function Head({ params }: PageProps) {
  const reactor = await getReactor(params.address);

  return (
    <DefaultHead
      title={`${reactor.symbol} Reactor`}
      description="View the history of deposits for Tokemak reactors"
    />
  );
}
