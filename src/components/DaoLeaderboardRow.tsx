import { DaoInformation, T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { Td, Tr, useQuery } from "@chakra-ui/react";
import { formatMoney } from "../util/maths";

type Props = {
  dao: DaoInformation;
};

export function DaoLeaderboardRow({ dao }: Props) {
  return (
    <Tr key={dao.name}>
      <Td>{dao.name}</Td>
      <Td>{dao.stage}</Td>
      <Td isNumeric>{formatMoney(dao.total)}</Td>
    </Tr>
  );
}
