import {
  Box,
  Button,
  LinkBox,
  Table,
  TableCaption,
  Tbody,
  Tfoot,
  Th,
  Thead,
  Tr,
  Link as UiLink,
  Td,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { Page } from "../../components/Page";
import { formatMoney, formatNumber } from "../../util/maths";
import { GetStaticProps } from "next";
import Link from "next/link";
import { prisma } from "../../util/db";
import { Dao } from "@prisma/client";
import { tokePrice, useTokePrice } from "../../util/api/tokemak";
import { updateAll } from "../../tokeTokenAmounts";

type Props = {
  toke_price: number;
  daos: {
    name: string;
    stage: number;
    toke: number;
  }[];
};

export default function Leaderboard({
  toke_price: cachedTokePrice,
  daos,
}: Props) {
  const total = daos.reduce((acc, { toke }) => acc + toke, 0);

  const toke_price = useTokePrice(cachedTokePrice);

  return (
    <Page header="Leaderboard">
      <LinkBox>
        <Link href="/stages" passHref>
          <Button
            w={"full"}
            maxW={"md"}
            variant={"outline"}
            leftIcon={<FontAwesomeIcon icon={faListCheck} />}
          >
            Discover the Stages of Liquidity
          </Button>
        </Link>
      </LinkBox>

      <Box borderWidth="1px" borderRadius="lg" shadow="md" p="6">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Stage</Th>
              <Th isNumeric>TOKE Holdings</Th>
              <Th isNumeric>USD Value</Th>
              <Th isNumeric>%</Th>
            </Tr>
          </Thead>
          <Tbody>
            {daos.map((dao) => (
              <Tr key={dao.name}>
                <Td>{dao.name}</Td>
                <Td>{dao.stage}</Td>
                <Td isNumeric>{formatNumber(dao.toke)}</Td>
                <Td isNumeric>{formatMoney(dao.toke * toke_price || 0)}</Td>
                <Td isNumeric>{((dao.toke / total) * 100).toFixed(1)}%</Td>
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Name</Th>
              <Th>Stage</Th>
              <Th isNumeric>TOKE Holdings</Th>
              <Th isNumeric>USD Value</Th>
              <Th isNumeric>%</Th>
            </Tr>
          </Tfoot>
          <TableCaption>
            Leaderboard tracks the DAOs with the top TOKE holdings
          </TableCaption>
        </Table>
      </Box>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  await updateAll();

  const daos = await prisma.$queryRaw<(Dao & { toke: number })[]>`
    select daos.*, round((sum(dt.value )/10^18)::numeric,2) as toke 
    from daos
    inner join dao_addresses da on daos.name = da.dao_name
    inner join dao_transactions dt on da.address = dt.dao_address
    group by daos.name
    order by toke desc
`;

  return {
    props: {
      toke_price: await tokePrice(),
      daos: daos,
    },
    revalidate: 60 * 5,
  };
};
