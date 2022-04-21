import axios from "axios";
import { addDays, getUnixTime } from "date-fns";

export const geckoAPI = axios.create({
  baseURL: "https://api.coingecko.com/api/v3/",
  headers: {
    accept: "application/json",
  },
});

export type CoinInfo = {
  id: string;
  symbol: string;
  name: string;
  contract_address: string;
  links: {
    chat_url: string[];
    twitter_screen_name: string;
  };
  market_data: {
    circulating_supply: number;
    market_cap: {
      usd: number;
    };
    current_price: {
      usd: number;
    };
  };
};

export async function getHistoricalPrice(coin: string) {
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

  return data.prices.reduce<Record<string, number>>(
    (acc, [time, price]) => ({ ...acc, [time]: price }),
    {}
  );
}

export async function useGeckoData(coin?: string) {
  const { data } = await geckoAPI.get<CoinInfo>(`coins/${coin}`, {
    params: {
      localization: "en",
      tickers: false,
      community_data: false,
      developer_data: false,
      sparkline: false,
    },
  });
  return data;
}

export async function search(query: string) {
  const { data } = await geckoAPI.get<{
    coins: {
      id: string;
      name: string;
      symbol: string;
    }[];
  }>(`search`, {
    params: {
      query,
    },
  });
  return data.coins;
}
