import axios from "axios";
import { useQuery } from "react-query";
import { addDays, getUnixTime } from "date-fns";

let geckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3/",
  headers: {
    accept: "application/json",
  },
});

export function useTokePrice() {
  return useQuery(
    "tokemakPrice",
    async () => {
      const { data } = await axios.get<{ prices: { toke: number } }>(
        "https://tokemakmarketdata.s3.amazonaws.com/current.json"
      );
      return data;
    },
    {
      select: (data) => data.prices.toke,
      staleTime: 1000 * 60 * 2, // 2 min
    }
  );
}

export function useHistoricalPrice(coin?: string) {
  return useQuery(
    ["market_chart/range", coin],
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

export function useGeckoData(coin?: string) {
  return useQuery([`coins/${coin}`, coin], async () => {
    const { data } = await geckoAPI.get<{
      id;
      symbol;
      name;
      market_data;
      links;
    }>(`coins/${coin}`, {
      params: {
        localization: "en",
        tickers: false,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });
    return data;
  });
}
