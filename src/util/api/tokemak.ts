import axios from "axios";
import { useQuery } from "react-query";

export async function tokePrice() {
  const { data } = await axios.get<{ prices: Record<string, number> }>(
    "https://tokemakmarketdata.s3.amazonaws.com/current.json"
  );
  return data;
}

export function useTokePrice(cachedTokePrice?: number) {
  return usePrice("toke", cachedTokePrice);
}

export function usePrice(token?: string, cachedTokePrice?: number) {
  let adjustedToken = (token || "").toLowerCase();

  if (adjustedToken === "weth") {
    adjustedToken = "eth";
  }

  const placeholderData = {
    prices: { [adjustedToken]: cachedTokePrice || 0 } as Record<string, number>,
  };

  const { data } = useQuery(["tokePrice"], tokePrice, {
    placeholderData,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 60,
    select: (data) => data.prices[adjustedToken] || 0,
    enabled: !!token,
  });
  return data || 0;
}
