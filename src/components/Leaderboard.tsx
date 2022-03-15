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
  Link,
} from "@chakra-ui/react";
import { DAOS } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { orderBy } from "lodash";
import { Page } from "./Page";
import { NavLink } from "react-router-dom";
import { DaoLeaderboardRow } from "./DaoLeaderboardRow";
import { useTotals } from "./TokeChart";

export function Leaderboard() {
  let formattedData = DAOS.map((dao) => {
    const { total: totalTOKE } = useTotals(dao.addresses);

    return {
      ...dao,
      totalTOKE,
    };
  });

  formattedData = orderBy(formattedData, "totalTOKE", "desc");

  return (
    <Page header="Leaderboard">
      <LinkBox>
        <Link as={NavLink} to="/stages">
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

      <Box maxW="xl" borderWidth="1px" borderRadius="lg" shadow="md" p="6">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Stage</Th>
              <Th isNumeric>TOKE Holdings</Th>
              <Th isNumeric>USD Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {formattedData.map((dao) => (
              <DaoLeaderboardRow dao={dao} key={dao.name} />
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Name</Th>
              <Th>Stage</Th>
              <Th isNumeric>TOKE Holdings</Th>
              <Th isNumeric>USD Value</Th>
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
