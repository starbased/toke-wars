import BigNumber from "bignumber.js";
import { BigNumber as EthBigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";

export function getAmount(array: { total: EthBigNumber; time: Date }[][]) {
  return (
    array
      .filter((obj) => obj.length > 0)
      // get the last record
      .map((obj) => obj[obj.length - 1])
      //add them up
      .reduce(
        (acc, { total }) => acc.plus(new BigNumber(formatEther(total))),
        new BigNumber(0)
      )
      .decimalPlaces(2)
      .toNumber()
  );
}

function format(number: number | bigint, options: Intl.NumberFormatOptions) {
  if (!number) {
    return number.toString();
  }
  return Intl.NumberFormat("en-US", options).format(number);
}

export function formatMoney(number: number | bigint) {
  return format(number, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatNumber(number: number | bigint) {
  return format(number, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
