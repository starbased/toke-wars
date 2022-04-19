import { DaoInformation } from "../constants";
import { Td, Tr } from "@chakra-ui/react";
import { formatMoney, formatNumber } from "../util/maths";
import { useTokePrice } from "../api/coinGecko";

type Props = {
  dao: DaoInformation & { totalTOKE: number };
  total: number;
};

export function DaoLeaderboardRow({ dao, total }: Props) {
  const { data: toke_price } = useTokePrice();
  let percentage = formatNumber((dao.totalTOKE / total) * 100);

  return (
    <Tr key={dao.name}>
      <Td>{dao.name}</Td>
      <Td>{dao.stage}</Td>
      <Td isNumeric>{formatNumber(dao.totalTOKE)}</Td>
      <Td isNumeric>{formatMoney(dao.totalTOKE * toke_price || 0)}</Td>
      <Td isNumeric>{parseInt(percentage)}%</Td>
    </Tr>
  );
}
