import { Page } from "components/Page";
import { faMedium } from "@fortawesome/free-brands-svg-icons";
import { LinkCard } from "components/LinkCard";
import { Card } from "components/Card";
import { STAGE_MAP } from "@/constants";

export default function Index() {
  return (
    <Page header="Stages of Liquidity" className="items-center">
      <LinkCard
        title={'Read More on "The Evolution of DAOs"'}
        url="https://medium.com/tokemak/the-evolution-of-daos-1692509bbb41"
        icon={faMedium}
      />

      {Object.entries(STAGE_MAP).map(([stage, { title, description }]) => (
        <Card className="w-full md:w-2/3" key={stage}>
          <h1>Stage {stage}</h1>
          <h2>{title}</h2>
          <p>{description}</p>
        </Card>
      ))}
    </Page>
  );
}
