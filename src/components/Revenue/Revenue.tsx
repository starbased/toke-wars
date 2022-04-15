import { useQueries } from "react-query";
import { ERC20__factory } from "../../typechain";
import { provider } from "../../util/providers";
import { formatEther } from "ethers/lib/utils";
import { TransferEvent } from "../../typechain/ERC20";
import { groupBy, orderBy } from "lodash";
import { useGeckoData } from "../../api/coinGecko";
import { BigNumber } from "bignumber.js";
import { Formatter } from "../Formatter";
import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  chakra,
  Link,
  Button,
  LinkBox,
} from "@chakra-ui/react";
import { shortenAddress } from "../../util/maths";
import { Page } from "../Page";
import { faListCheck, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

export function Revenue() {
  const tokens = {
    "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b": {
      name: "CVX",
      gecko_id: "convex-finance",
    },
    "0xd533a949740bb3306d119cc777fa900ba034cd52": {
      name: "CRV",
      gecko_id: "curve-dao-token",
    },
  };

  const queries = useQueries(
    Object.entries(tokens).map(([tokenContract]) => ({
      queryKey: ["contract", tokenContract],
      queryFn: () => {
        const contract = ERC20__factory.connect(tokenContract, provider);

        return contract.queryFilter(
          contract.filters.Transfer(
            "0xA86e412109f77c45a3BC1c5870b880492Fb86A14",
            "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B"
          ),
          14489954
        );
      },
    }))
  );

  let data = queries.reduce<TransferEvent[]>(
    (acc, obj) => [...acc, ...(obj.data || [])],
    []
  );

  const usdValues = Object.entries(tokens)
    .map(([, { gecko_id }]) => useGeckoData(gecko_id))
    .reduce((acc, obj) => {
      if (obj.data) {
        return {
          ...acc,
          [obj.data.contract_address]: obj.data.market_data.current_price.usd,
        };
      }
      return { ...acc };
    }, {});

  data = orderBy(data, "blockNumber", "desc");

  const totals = Object.entries(groupBy(data, "address")).map(
    ([address, data]) => {
      const value = formatEther(
        data.map((obj) => obj.args.value).reduce((a, b) => a.add(b))
      );
      return {
        address,
        value,
        usdValue: new BigNumber(value)
          .times(usdValues[address.toLowerCase()])
          .toNumber(),
      };
    }
  );

  return (
    <Page header="Protocol Revenue">
      <LinkBox>
        <Link
          target="_blank"
          href="https://tokenterminal.com/terminal/projects/tokemak"
        >
          <Button
            w={"full"}
            maxW={"md"}
            variant={"outline"}
            leftIcon={<FontAwesomeIcon icon={faTerminal} />}
          >
            More Data via Token Terminal
          </Button>
        </Link>
      </LinkBox>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        shadow="md"
        p="6"
        marginBottom="10"
      >
        <chakra.h2 textAlign="center" fontSize="xl" pb={8} fontWeight="bold">
          Totals
        </chakra.h2>
        <Table>
          <Thead>
            <Tr>
              <Th>Coin</Th>
              <Th>Amount</Th>
              <Th>USD Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {totals?.map((tx) => (
              <Tr key={tx.address}>
                <Td>{tokens[tx.address.toLowerCase()].name}</Td>
                <Td>
                  <Formatter
                    value={parseFloat(tx.value)}
                    options={{
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }}
                  />
                </Td>
                <Td>
                  <Formatter currency value={tx.usdValue} />
                </Td>
              </Tr>
            ))}
            <Tr>
              <Td>Total</Td>
              <Td>
                {/* no point in summing token quantities since they are not comparable */}
              </Td>
              <Td>
                <Formatter
                  currency
                  value={totals
                    .map((obj) => obj.usdValue)
                    .reduce<number>((a, b) => a + b, 0)}
                />
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
      <Box borderWidth="1px" borderRadius="lg" shadow="md" p="6">
        <chakra.h2 textAlign="center" fontSize="xl" pb={8} fontWeight="bold">
          Events
        </chakra.h2>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Block Number</Th>
              <Th>Tx</Th>
              <Th>Coin</Th>
              <Th>Amount</Th>
              <Th>USD Value</Th>
            </Tr>
          </Thead>

          <Tbody>
            {data?.map((tx) => (
              <Tr key={tx.transactionHash + tx.address}>
                <Td>{tx.blockNumber}</Td>
                <Td>
                  <Link
                    href={`https://etherscan.io/tx/${tx.transactionHash}`}
                    target="_blank"
                  >
                    {shortenAddress(tx.transactionHash)}
                  </Link>
                </Td>
                <Td>{tokens[tx.address.toLowerCase()].name}</Td>

                <Td>
                  <Formatter
                    value={parseFloat(formatEther(tx.args.value.toString()))}
                    options={{
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }}
                  />
                </Td>
                <Td>
                  <Formatter
                    currency
                    value={new BigNumber(formatEther(tx.args.value.toString()))
                      .times(usdValues[tx.address.toLowerCase()])
                      .toNumber()}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Page>
  );
}
