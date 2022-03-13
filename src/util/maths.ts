import BigNumber from "bignumber.js";

export function getAmount(array: { total: string; time: Date }[][]) {
  return (
    array
      .filter((obj) => obj.length > 0)
      // get the last record
      .map((obj) => obj[obj.length - 1])
      //add them up
      .reduce(
        (obj, acc) => obj.plus(new BigNumber(acc.total)),
        new BigNumber(0)
      )
      .decimalPlaces(2)
      .toNumber()
  );
}

function format(number: number | bigint, options: Intl.NumberFormatOptions) {
  if (!number) {
    return number;
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
