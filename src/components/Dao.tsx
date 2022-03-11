import { TokeChart } from "./TokeChart";
import { T_TOKE_CONTRACT, TOKE_CONTRACT } from "../constants";
import { useAmounts } from "../api/Erc20";
import { useNewStaking } from "../api/TokeStaking";
import { Table, Box, TableCaption, Tbody, Td, Thead, Tr, StackDivider, Heading, Center, Divider } from "@chakra-ui/react";
import { Container, Badge, Stack, HStack, VStack } from '@chakra-ui/react';
import { DaoDetailsCard } from "./DaoDetailsCard";

type Props = {
  addresses: string[];
  name: string;
};

export function Dao({ addresses, name }: Props) {
  const { data: newStaking } = useNewStaking(addresses);

  return (
    <div>
      <Container maxW='container.xl'>
      <VStack
          spacing={10}
          align='stretch'
        >
        <DaoDetailsCard name={name} stage={'2'} addresses={addresses} total={12345} />
        <Divider />
        <Center>
          <TokeChart addresses={addresses} />
        </Center>
        <Heading as='h4' size='md'>TOKE</Heading>
        <AmountsTable token={TOKE_CONTRACT} addresses={addresses} />
        <Heading as='h4' size='md'>tTOKE</Heading>
        <AmountsTable token={T_TOKE_CONTRACT} addresses={addresses} />
        <Heading as='h4' size='md'>New Staking</Heading>
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Td>Amount</Td>
              <Td>Block</Td>
            </Tr>
          </Thead>
          <Tbody>
            {newStaking?.map((obj) => (
              <Tr key={obj.event.transactionHash}>
                <Td>{obj.total}</Td>
                <Td>{obj.time.toString()}</Td>
              </Tr>
            )) || null}
          </Tbody>
        </Table>
        </VStack>
      </Container>
    </div>
  );
}

function AmountsTable({
  token,
  addresses,
}: {
  token: string;
  addresses: string[];
}) {
  const { data } = useAmounts(addresses, token);

  return (
    <Table variant='simple' size='sm'>
      {/* <TableCaption>Table Caption</TableCaption> */}      
      <Thead>
        <Tr>
          <Td>Amount</Td>
          <Td>Date</Td>
        </Tr>
      </Thead>
      <Tbody>
        {data
          ? data.map((obj) => (
              <Tr key={obj.event.transactionHash}>
                <Td>{obj.total.toString()}</Td>
                <Td>{obj.time.toString()}</Td>
              </Tr>
            ))
          : null}
      </Tbody>
    </Table>
  );
}
