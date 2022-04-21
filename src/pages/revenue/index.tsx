import {
  Box,
  Button,
  chakra,
  Icon as UiIcon,
  Link,
  LinkBox,
  SimpleGrid,
  Stat,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
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
import { getBlocks, getProvider } from "../../util";
import { getGeckoData } from "../../util/api/coinGecko";
import { BigNumber } from "bignumber.js";
import { Coin } from "../../components/coin";
import { intlFormat, isAfter, sub } from "date-fns";
import { BaseCard } from "../../components/DaoDetailsCard";

type Props = {
  values: {
    coin: string;
    transactions: {
      transactionHash: string;
      blockNumber: number;
      value: string;
      timestamp: number;
    }[];
    price: number;
  }[];
};

function usdValueOverRange(
  data: { timestamp: number; usdValue: number }[],
  duration: Duration
) {
  const lastWeek = sub(new Date(), duration);

  const index = data.findIndex((obj) =>
    isAfter(lastWeek, new Date(obj.timestamp))
  );

  return data
    .slice(0, index)
    .map((obj) => obj.usdValue)
    .reduce((a, b) => a + b, 0);
}

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
      <SimpleGrid
        columns={{ base: 1, md: 3 }}
        spacing={{ base: 5, lg: 8 }}
        style={{ alignSelf: "stretch" }}
        px={5}
      >
        <BaseCard title="Total Weekly Revenue">
          <Stat>
            <StatNumber>
              {" "}
              <Formatter
                currency
                value={usdValueOverRange(data, { weeks: 1 })}
              />
            </StatNumber>
          </Stat>
        </BaseCard>

        <BaseCard title="Total Monthly Revenue">
          <Stat>
            <StatNumber>
              <Formatter
                currency
                value={usdValueOverRange(data, { months: 1 })}
              />
            </StatNumber>
          </Stat>
        </BaseCard>
        <BaseCard title="Projected Yearly Revenue">
          <Stat>
            <StatNumber>
              <Formatter
                currency
                value={usdValueOverRange(data, { months: 1 }) * 12}
              />
            </StatNumber>
          </Stat>
        </BaseCard>
      </SimpleGrid>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        shadow="md"
        p="6"
        marginBottom="2"
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
      <Box borderWidth="1px" borderRadius="lg" shadow="md" p="6">
        <chakra.h2 textAlign="center" fontSize="xl" pb={8} fontWeight="bold">
          Events
        </chakra.h2>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Time</Th>
              <Th>Tx</Th>
              <Th>Coin</Th>
              <Th>Amount</Th>
              <Th>USD Value</Th>
            </Tr>
          </Thead>

          <Tbody>
            {data?.map((tx) => (
              <Tr key={tx.transactionHash + tx.coin + tx.amount}>
                <Td>
                  {intlFormat(new Date(tx.timestamp), {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Td>
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

      const timestamps = (
        await getBlocks(transactions.map((obj) => obj.blockNumber))
      ).reduce<Record<number, Date>>(
        (acc, obj) => ({ ...acc, [obj.number]: obj.timestamp }),
        {}
      );

      const gecko_data = await getGeckoData(gecko_id);

      return {
        coin: name,
        transactions: transactions.map((obj) => ({
          ...obj,
          timestamp: timestamps[obj.blockNumber].getTime(),
        })),
        price: gecko_data.market_data.current_price.usd,
      };
    })
  );

  return {
    props: { values },
    revalidate: 60 * 5,
  };
};
