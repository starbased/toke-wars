import { DaoInformation } from "../constants";
import { Td, Tr } from "@chakra-ui/react";
import { formatMoney, formatNumber } from "../util/maths";
import { useTokenPrice } from "../api/coinGecko";

type Props = {
  dao: DaoInformation & { totalTOKE: number };
};

export function DaoLeaderboardRow({ dao }: Props) {
  const { data: toke_price } = useTokenPrice("tokemak");

  return (
    <Tr key={dao.name}>
      <Td>{dao.name}</Td>
      <Td>{dao.stage}</Td>
      <Td isNumeric>{formatNumber(dao.totalTOKE)}</Td>
      <Td isNumeric>{formatMoney(dao.totalTOKE * toke_price || 0)}</Td>
    </Tr>
  );
}
