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
import { DAOS, TOKE_CONTRACT, T_TOKE_CONTRACT } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { orderBy } from "lodash";
import { Page } from "./Page";
import { NavLink } from "react-router-dom";
import { DaoLeaderboardRow } from "./DaoLeaderboardRow";
import { useAmounts } from "../api/Erc20";
import { useNewStaking } from "../api/TokeStaking";
import { getAmount } from "../util/maths";

export function Leaderboard() {
  let formattedData = DAOS.map((dao) => {
    const { addresses } = dao;
    const { data: tokeEvents } = useAmounts(TOKE_CONTRACT, addresses);
    const { data: tTokeEvents } = useAmounts(T_TOKE_CONTRACT, addresses);
    const { data: newStaking } = useNewStaking(addresses);

    let totalTOKE = 0;

    if (tokeEvents && tTokeEvents && newStaking) {
      const array = [tokeEvents, tTokeEvents, newStaking];
      totalTOKE = getAmount(array);
    }

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
