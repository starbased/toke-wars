"use client";

import { formatMoney, formatNumber } from "utils/maths";
import { useTokePrice } from "hooks/useTokenPrice";
import { Coin } from "components/coin";

type Props = {
  dao: {
    name: string;
    stage: number;
    coin: string;
    toke: number;
  };
  cachedTokePrice: number;
  total: number;
};

export function Row({ dao, cachedTokePrice, total }: Props) {
  const toke_price = useTokePrice(cachedTokePrice);

  return (
    <tr>
      <td>
        <Coin coin={dao.coin}>{dao.name}</Coin>
      </td>
      <td>{dao.stage}</td>
      <td>{formatNumber(dao.toke)}</td>
      <td>{formatMoney(dao.toke * toke_price || 0)}</td>
      <td>{((dao.toke / total) * 100).toFixed(1)}%</td>
    </tr>
  );
}
