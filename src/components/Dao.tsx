import { TokeChart } from "./TokeChart";
import { T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { useAmounts } from "../api/Erc20";
import { useNewStaking } from "../api/TokeStaking";
import { Center, Divider } from "@chakra-ui/react";
import { Container, VStack } from "@chakra-ui/react";
import { DaoDetailsCard } from "./DaoDetailsCard";
import BigNumber from "bignumber.js";

type Props = {
  addresses: string[];
  name: string;
};

export function Dao({ addresses, name }: Props) {
  const { data: tokeEvents } = useAmounts(addresses, TOKE_CONTRACT);
  const { data: tTokeEvents } = useAmounts(addresses, T_TOKE_CONTRACT);
  const { data: newStaking } = useNewStaking(addresses);

  let total = 0;

  if (tokeEvents && tTokeEvents && newStaking) {
    total = [tokeEvents, tTokeEvents, newStaking]
      .filter((obj) => obj.length > 0)
      // get the last record
      .map((obj) => obj[obj.length - 1])
      //add them up
      .reduce(
        (obj, acc) => obj.plus(new BigNumber(acc.total)),
        new BigNumber(0)
      )
      .decimalPlaces(2)
      .toNumber();
  }

  return (
    <div>
      <Container maxW="container.xl">
        <VStack spacing={10} align="stretch">
          <DaoDetailsCard
            name={name}
            stage="2"
            addresses={addresses}
            total={total}
          />
          <Divider />
          <Center>
            <TokeChart addresses={addresses} />
          </Center>
        </VStack>
      </Container>
    </div>
  );
}
