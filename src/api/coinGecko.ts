import axios from "axios";
import { useQuery } from "react-query";
import { addDays, getUnixTime } from "date-fns";

let geckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3/",
  headers: {
    accept: "application/json",
  },
});

export function useTokenPrice(coin: string) {
  return useQuery(
    ["tokenPrice", coin],
    async () => {
      const { data } = await geckoAPI.get<Record<string, { usd: number }>>(
        `simple/price`,
        { params: { ids: coin, vs_currencies: "usd" } }
      );
      return data[coin].usd;
    },
    {
      staleTime: 1000 * 60 * 2,
    }
  );
}

export function useHistoricalPrice(coin?: string) {
  return useQuery(
    ["price", coin],
    async () => {
      const { data } = await geckoAPI.get<{ prices: [number, number][] }>(
        `coins/${coin}/market_chart/range`,
        {
          params: {
            vs_currency: "usd",
            //has to be at least 90 days to get in a daily scale
            //TODO: make sure to go back far enough fetch transactions first
            from: getUnixTime(addDays(new Date(), -91)),
            to: getUnixTime(new Date()),
          },
        }
      );
      return data;
    },
    {
      enabled: !!coin,
      select(data) {
        return data.prices.reduce<Record<number, number>>(
          (acc, [time, price]) => ({ ...acc, [time]: price }),
          {}
        );
      },
    }
  );
}
