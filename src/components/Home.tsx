import { DAOS } from "../constants";
import { BaseCard } from "./DaoDetailsCard";
import { SimpleGrid, Stat, StatHelpText, StatNumber } from "@chakra-ui/react";
import { TokeChart, useTotals } from "./TokeChart";
import { Page } from "./Page";
import { formatMoney, formatNumber } from "../util/maths";
import { REACTORS } from "../constants";
import { useTokePrice } from "../api/coinGecko";
import { parseInt } from "lodash";
import { useMarketData } from "../api/coinGecko";

export function Home() {
  const addresses = Object.values(DAOS).flatMap((obj) => obj.addresses);
  const { total: daoOwned } = useTotals(addresses);

  const { data: toke_price } = useTokePrice();
  const { data: tokenInfo } = useMarketData("tokemak");

  return (
    <Page header="Toke Wars Dashboard">
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={{ base: 5, lg: 8 }}
        style={{ alignSelf: "stretch" }}
        px={5}
      >
        <BaseCard title="Total DAO Owned TOKE">
          <Stat>
            <StatNumber>{formatNumber(daoOwned)}</StatNumber>
            <StatHelpText>{formatMoney(daoOwned * toke_price)}</StatHelpText>
          </Stat>
        </BaseCard>

        <BaseCard title="Circulating Supply">
          <Stat>
            <StatNumber>
              {formatNumber(
                parseInt(tokenInfo?.market_data?.circulating_supply)
              )}
            </StatNumber>
            <StatHelpText>
              {formatMoney(parseFloat(tokenInfo?.market_data?.market_cap?.usd))}
            </StatHelpText>
          </Stat>
        </BaseCard>

        <BaseCard title="DAOs Accumulating">
          <Stat>
            <StatNumber>{DAOS.length}</StatNumber>
            <StatHelpText>Total Reactors: {REACTORS.length}</StatHelpText>
          </Stat>
        </BaseCard>
      </SimpleGrid>

      <TokeChart addresses={addresses} />
    </Page>
  );
}
