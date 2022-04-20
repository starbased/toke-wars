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
