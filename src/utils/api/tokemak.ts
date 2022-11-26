export async function tokePrice() {
  const data: { prices: { toke: number } } = await fetch(
    "https://tokemakmarketdata.s3.amazonaws.com/current.json"
  ).then((res) => res.json());

  return data.prices.toke;
}
