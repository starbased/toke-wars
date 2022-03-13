import { useMemo } from "react";

export function Formatter({
  value,
  currency = false,
  options = {},
}: {
  value: number | bigint;
  currency?: boolean;
  options?: Intl.NumberFormatOptions;
}) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(
        "en-US",
        currency
          ? {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              ...options,
            }
          : options
      ),
    [currency, options]
  );
  return <>{formatter.format(value)}</>;
}
