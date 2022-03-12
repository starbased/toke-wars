import { DaoInformation, T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { useAmounts } from "../api/Erc20";
import { useNewStaking } from "../api/TokeStaking";
import { Td, Tr, useQuery } from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import axios from "axios";

function getTokenPrice(coin?: string) {
  async () => {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
    );
    return data;
  };
}
let toke_price = await getTokenPrice("toke");

console.log("toke price", toke_price);

function getAmount(array: { total: string; time: Date }[][]) {
  return (
    array
      .filter((obj) => obj.length > 0)
      // get the last record
      .map((obj) => obj[obj.length - 1])
      //add them up
      .reduce(
        (obj, acc) => obj.plus(new BigNumber(acc.total)),
        new BigNumber(0)
      )
      .decimalPlaces(2)
      .toNumber()
  );
}

type Props = {
  dao: DaoInformation;
};

export function DaoLeaderboardRow({ dao }: Props) {
  const { addresses } = dao;
  const { data: tokeEvents } = useAmounts(TOKE_CONTRACT, addresses);
  const { data: tTokeEvents } = useAmounts(T_TOKE_CONTRACT, addresses);
  const { data: newStaking } = useNewStaking(addresses);

  let total = 0;

  if (tokeEvents && tTokeEvents && newStaking) {
    const array = [tokeEvents, tTokeEvents, newStaking];
    total = getAmount(array);
  }

  return (
    <Tr key={dao.name}>
      <Td>{dao.name}</Td>
      <Td>{dao.stage}</Td>
      <Td isNumeric>${total.toLocaleString()}</Td>
    </Tr>
  );
}
