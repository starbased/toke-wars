"use client";

import { useQuery } from "@tanstack/react-query";
import { tokePrice } from "utils/api/tokemak";

export function useTokePrice(cachedTokePrice?: number) {
  const { data } = useQuery(["tokePrice"], tokePrice, {
    placeholderData: cachedTokePrice,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 60,
  });
  return data || 0;
}
