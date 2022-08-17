import { Page } from "../../components/Page";
import { ERC20__factory, UniswapV2__factory } from "../../typechain";
import { GetStaticPaths, GetStaticProps } from "next";
import { getProvider } from "../../util";
import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { BURN, TOKEMAK_MANAGER } from "../../constants";
import { usePrice } from "../../util/api/tokemak";
import { formatMoney, formatNumber, shortenAddress } from "../../util/maths";
import Link from "next/link";

type Token = {
  symbol: string;
  input: string;
  current: string;
};

type Props = {
  token0?: Token;
  token1?: Token;
  transactions?: {
    transactionHash: string;
    amount0: string;
    amount1: string;
  }[];
};

const addresses = [
  ["0xAd5B1a6ABc1C9598C044cea295488433a3499eFc", "GAMMA", "WETH"],
  ["0x61eB53ee427aB4E007d78A9134AaCb3101A2DC23", "FXS", "WETH"],
  ["0x43AE24960e5534731Fc831386c07755A2dc33D47", "SNX", "WETH"],
  ["0x470e8de2eBaef52014A47Cb5E6aF86884947F08c", "WETH", "FOX"],
  ["0xecBa967D84fCF0405F6b32Bc45F4d36BfDBB2E81", "FXS", "WETH"],
  ["0xe55c3e83852429334A986B265d03b879a3d188Ac", "TCR", "WETH"],
  // ["0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8", "WETH", "ALCX"],
];

const transform = (token: Token, price: number) => {
  const difference = BigNumber.from(token.current).sub(token.input).toString();
  return {
    ...token,
    difference,
    differenceUSD: price * parseInt(formatEther(difference)),
  };
};

export default function Uni({ token0, token1, transactions }: Props) {
  const token0Price = usePrice(token0?.symbol);
  const token1Price = usePrice(token1?.symbol);

  if (!token0 || !token1) {
    return <div>loading</div>;
  }

  const rows = [transform(token0, token0Price), transform(token1, token1Price)];

  const total = rows.map((row) => row.differenceUSD).reduce((a, b) => a + b, 0);

  return (
    <Page header="LP Stats">
      <ul>
        {addresses.map(([address, a, b]) => (
          <li key={address}>
            <Link href={`/uni/${address}`}>
              {a !== "" ? a + "/" + b : address}
            </Link>
          </li>
        ))}
      </ul>
      <div>total: {formatMoney(total)}</div>
      <table style={{ borderSpacing: 5, borderCollapse: "separate" }}>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Input</th>
            <th>Current</th>
            <th>Difference</th>
            <th>Price Difference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Row {...row} key={row.symbol} />
          ))}
        </tbody>
      </table>

      <table style={{ borderSpacing: 5, borderCollapse: "separate" }}>
        <thead>
          <tr>
            <th>Transaction</th>
            <th>{token0.symbol}</th>
            <th>{token1.symbol}</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.map(({ transactionHash, amount0, amount1 }) => (
            <tr key={transactionHash}>
              <td>
                {" "}
                <Link
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                >
                  {shortenAddress(transactionHash)}
                </Link>
              </td>
              <td>{formatNumber(parseFloat(formatEther(amount0)), 2)}</td>
              <td>{formatNumber(parseFloat(formatEther(amount1)), 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

function Row({
  input,
  current,
  symbol,
  difference,
  differenceUSD,
}: {
  difference: string;
  differenceUSD: number;
} & Token) {
  const format = (input: string) =>
    formatNumber(parseFloat(formatEther(input)), 2);

  return (
    <tr>
      <td>{symbol}</td>
      <td>{format(input)}</td>
      <td>{format(current)}</td>
      <td>{format(difference)}</td>
      <td>{formatMoney(differenceUSD)}</td>
    </tr>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: addresses.map(([address]) => ({ params: { address } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<
  Props,
  { address: string }
> = async ({ params }) => {
  if (!params?.address) {
    throw Error("Unknown tAsset");
  }

  let amount0 = BigNumber.from(0);
  let amount1 = BigNumber.from(0);
  const transactions = [];

  const uniswapContract = UniswapV2__factory.connect(
    params?.address,
    getProvider()
  );

  let mints = await uniswapContract.queryFilter(
    uniswapContract.filters.Transfer(BURN, TOKEMAK_MANAGER)
  );

  for (let transaction of mints) {
    const receipt = await transaction.getTransactionReceipt();
    const mintLog = receipt.logs.find(
      (log) => log.logIndex === transaction.logIndex + 2
    );

    if (!mintLog) continue;

    const [logAmount0, logAmount1] = ethers.utils.defaultAbiCoder.decode(
      ["uint", "uint"],
      mintLog.data
    );

    amount0 = amount0.add(logAmount0);
    amount1 = amount1.add(logAmount1);
    // calBalance = calBalance.add(transaction.args.value);
    transactions.push({
      transactionHash: transaction.transactionHash,
      amount0: logAmount0.toString(),
      amount1: logAmount1.toString(),
    });
  }

  const burns = await uniswapContract.queryFilter(
    uniswapContract.filters.Burn(null, null, null, TOKEMAK_MANAGER)
  );
  for (let transaction of burns) {
    amount0 = amount0.sub(transaction.args.amount0);
    amount1 = amount1.sub(transaction.args.amount1);
    transactions.push({
      transactionHash: transaction.transactionHash,
      amount0: "-" + transaction.args.amount0.toString(),
      amount1: "-" + transaction.args.amount1.toString(),
    });
  }

  const balance = await uniswapContract.balanceOf(TOKEMAK_MANAGER);
  const totalSupply = await uniswapContract.totalSupply();

  const [reserve0, reserve1] = await uniswapContract.getReserves();

  return {
    props: {
      token0: {
        symbol: await getToken(await uniswapContract.token0()),
        input: amount0.toString(),
        current: reserve0.mul(balance).div(totalSupply).toString(),
      },
      token1: {
        symbol: await getToken(await uniswapContract.token1()),
        input: amount1.toString(),
        current: reserve1.mul(balance).div(totalSupply).toString(),
      },
      transactions,
    },
  };
};

function getToken(address: string) {
  const contract = ERC20__factory.connect(address, getProvider());
  return contract.symbol();
}
