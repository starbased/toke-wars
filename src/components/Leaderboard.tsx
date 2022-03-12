import {
  VStack,
  Box,
  Text,
  Center,
  chakra,
  Button,
  LinkBox,
  LinkOverlay,
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
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { sortBy } from "lodash";

export function Leaderboard() {
  return (
    <div>
      <Center>
        <VStack spacing={6} align="stretch">
          <Box maxW="7xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <chakra.h1
              textAlign="center"
              fontSize="4xl"
              pb={2}
              fontWeight="bold"
            >
              Leaderboard
            </chakra.h1>
          </Box>
          <Center>
            <LinkBox>
              <Button
                w={"full"}
                maxW={"md"}
                variant={"outline"}
                leftIcon={<FontAwesomeIcon icon={faListCheck} />}
              >
                <Center>
                  <Text>
                    <LinkOverlay href="/stages">
                      <LinkContainer to="/stages">
                        <Link>Discover the Stages of Liquidity</Link>
                      </LinkContainer>
                    </LinkOverlay>
                  </Text>
                </Center>
              </Button>
            </LinkBox>
          </Center>
          <Center>
            <Box maxW="xl" borderWidth="1px" borderRadius="lg" shadow="md">
              <Box p="6">
                <Table variant="simple">
                  <TableCaption>
                    Leaderboard tracks the DAOs with the top TOKE holdings
                  </TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Stage</Th>
                      <Th isNumeric>TOKE Holdings (USD)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortBy(DAOS, "name").map(({ name, stage }) => (
                      <Tr>
                        <Td>{name}</Td>
                        <Td>{stage}</Td>
                        <Td isNumeric>$12,345</Td>
                      </Tr>
                    ))}
                  </Tbody>
                  <Tfoot>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Stage</Th>
                      <Th isNumeric>TOKE Holdings (USD)</Th>
                    </Tr>
                  </Tfoot>
                </Table>
              </Box>
            </Box>
          </Center>
        </VStack>
      </Center>
    </div>
  );
}
