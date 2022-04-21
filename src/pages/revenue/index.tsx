import {
  Box,
  Button,
  chakra,
  Link,
  LinkBox,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Icon as UiIcon,
  Tr,
} from "@chakra-ui/react";
import { orderBy } from "lodash";
import { Page } from "../../components/Page";
import { ERC20__factory } from "../../typechain";
import { shortenAddress } from "../../util/maths";
import { Formatter } from "../../components/Formatter";
import { GetStaticProps } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTerminal } from "@fortawesome/free-solid-svg-icons";
import { getProvider } from "../../util";
import { getGeckoData } from "../../util/api/coinGecko";
import { BigNumber } from "bignumber.js";
import Image from "next/image";
import { Coin } from "../../components/coin";

type Props = {
  values: {
    coin: string;
    transactions: {
      transactionHash: string;
      blockNumber: number;
      value: string;
    }[];
    price: number;
  }[];
};

export default function Revenue({ values }: Props) {
  const totals = values.map(({ coin, transactions, price }) => {
    const amount = transactions
      .map(({ value }) => new BigNumber(value))
      .reduce((a, b) => a.plus(b), new BigNumber(0))
      .div(10 ** 18);

    return {
      coin,
      amount,
      usdValue: amount.times(price).toNumber(),
    };
  });

  const data = orderBy(
    values.flatMap(({ coin, transactions, price }) =>
      transactions.map((tx) => {
        const amount = new BigNumber(tx.value).div(10 ** 18);
        return {
          ...tx,
          amount: amount.toNumber(),
          usdValue: amount.times(price).toNumber(),
          coin,
        };
      })
    ),
    "blockNumber",
    "desc"
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
            leftIcon={<UiIcon as={FontAwesomeIcon} icon={faTerminal} />}
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
            {totals?.map(({ coin, amount, usdValue }) => (
              <Tr key={coin}>
                <Td>
                  <Coin coin={coin}>{coin}</Coin>
                </Td>
                <Td>
                  <Formatter
                    value={amount.toNumber()}
                    options={{
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }}
                  />
                </Td>
                <Td>
                  <Formatter currency value={usdValue} />
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
              <Tr key={tx.transactionHash + tx.coin}>
                <Td>{tx.blockNumber}</Td>
                <Td>
                  <Link
                    href={`https://etherscan.io/tx/${tx.transactionHash}`}
                    target="_blank"
                  >
                    {shortenAddress(tx.transactionHash)}
                  </Link>
                </Td>
                <Td>
                  <Coin coin={tx.coin}>{tx.coin}</Coin>
                </Td>

                <Td>
                  <Formatter
                    value={tx.amount}
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
          </Tbody>
        </Table>
      </Box>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
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

  const provider = getProvider();

  const values = await Promise.all(
    Object.entries(tokens).map(async ([tokenContract, { gecko_id, name }]) => {
      const contract = ERC20__factory.connect(tokenContract, provider);

      const transactions = (
        await contract.queryFilter(
          contract.filters.Transfer(
            // "0xA86e412109f77c45a3BC1c5870b880492Fb86A14",
            null,
            "0x8b4334d4812C530574Bd4F2763FcD22dE94A969B"
          ),
          14489954
        )
      ).map(({ transactionHash, blockNumber, args: { value } }) => ({
        transactionHash,
        blockNumber,
        value: value.toString(),
      }));

      const gecko_data = await getGeckoData(gecko_id);

      return {
        coin: name,
        transactions,
        price: gecko_data.market_data.current_price.usd,
      };
    })
  );

  return {
    props: { values },
    revalidate: 60 * 5,
  };
};
