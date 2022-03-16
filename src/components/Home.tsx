import { useCurrentBalance, useTotalSupply } from "../api/Erc20";
import { DAOS, TOKE_CONTRACT } from "../constants";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
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

  const { data: tokeTreasury } = useCurrentBalance(
    TOKE_CONTRACT,
    "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B"
  );

  const { data: toke_price } = useTokePrice();

  //TODO: this doesn't match the amount coin gecko says is vesting https://www.coingecko.com/en/coins/tokemak
  const { data: vesting } = useCurrentBalance(
    TOKE_CONTRACT,
    "0x96F98Ed74639689C3A11daf38ef86E59F43417D3"
  );

  const { data: totalSupply } = useTotalSupply(TOKE_CONTRACT);
  const { data: tokenInfo } = useMarketData("tokemak");

  let circulating = BigNumber.from(0);

  if (totalSupply && tokeTreasury && vesting) {
    circulating = totalSupply.sub(vesting).sub(tokeTreasury);
  }

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
