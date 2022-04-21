import axios from "axios";
import { useQuery } from "react-query";

export async function tokePrice() {
  const { data } = await axios.get<{ prices: { toke: number } }>(
    "https://tokemakmarketdata.s3.amazonaws.com/current.json"
  );
  return data.prices.toke;
}

export function useTokePrice(cachedTokePrice?: number) {
  const { data } = useQuery(["tokePrice"], tokePrice, {
    placeholderData: cachedTokePrice,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 60,
  });
  return data || 0;
}
