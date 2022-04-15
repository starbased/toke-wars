import BigNumber from "bignumber.js";
import { formatEther } from "ethers/lib/utils";
import { CumulativeRecord } from "./Types";

export function getAmount(array: (CumulativeRecord[] | undefined)[]) {
  return (
    array
      .filter(
        (obj): obj is CumulativeRecord[] => obj !== undefined && obj.length > 0
      )
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
    return "";
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

export function formatNumber(number: number | bigint, fDigits = 0) {
  return format(number, {
    minimumFractionDigits: fDigits,
    maximumFractionDigits: fDigits,
  });
}

export function shortenAddress(address: string, showCharacters = 5) {
  return (
    address.substring(0, showCharacters) +
    `...` +
    address.substring(address.length - showCharacters, address.length)
  );
}
