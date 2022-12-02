import axios from "axios";
import { getUnixTime } from "date-fns";
import axiosRetry from "axios-retry";
import pRetry, { AbortError } from "p-retry";

const baseURL = "https://api.coingecko.com/api/v3/";

const geckoAPI = axios.create({
  baseURL,
  headers: {
    accept: "application/json",
  },
});

axiosRetry(geckoAPI, {
  retries: 10,
  retryDelay: (retryCount) => 60 * 1000,
  retryCondition: (error) => error.response?.status === 429,
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

export async function getHistoricalPrice(coin: string, from: number) {
  const { data } = await geckoAPI.get<{ prices: [number, number][] }>(
    `coins/${coin}/market_chart/range`,
    {
      params: {
        vs_currency: "usd",
        //has to be at least 90 days to get in a daily scale
        from: from,
        to: getUnixTime(new Date()),
      },
    }
  );

  return data.prices.reduce<Record<string, number>>(
    (acc, [time, price]) => ({ ...acc, [time]: price }),
    {}
  );
}

export function getPrices(
  ids: string[]
): Promise<Record<string, { usd: number }>> {
  return retry(() =>
    fetch(
      baseURL +
        "simple/price?" +
        new URLSearchParams({
          vs_currencies: "usd",
          ids: ids.join(","),
        })
    )
  ).then((res) => res.json());
}

export async function getGeckoData(geckoId: string) {
  const { data } = await geckoAPI.get<CoinInfo>(`coins/${geckoId}`, {
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

function retry<T extends Response>(callback: () => Promise<T>) {
  return pRetry(
    async () => {
      const response = await callback();

      if (response.status === 429) {
        throw new AbortError(response.statusText);
      }
      return response;
    },
    { retries: 5, minTimeout: 60 * 1000 }
  );
}
