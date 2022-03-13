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

export function formatMoney(number) {
  let dollarUS = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return dollarUS.format(number);
}

export function numberWithCommas(number) {
  if (!number) {
    return number;
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
