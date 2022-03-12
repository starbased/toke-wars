import {
  Box,
  Button,
  LinkBox,
  Table,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  Link,
} from "@chakra-ui/react";
import { DAOS } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { sortBy } from "lodash";
import { Page } from "./Page";
import { NavLink } from "react-router-dom";
import { DaoLeaderboardRow } from "./DaoLeaderboardRow";

export function Leaderboard() {
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
              <Th isNumeric>TOKE Holdings (USD)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortBy(DAOS, "total").map((dao) => (
              <DaoLeaderboardRow dao={dao} key={dao.name} />
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Name</Th>
              <Th>Stage</Th>
              <Th isNumeric>TOKE Holdings (USD)</Th>
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
