export const getTokenPricesInUSD = async (ids: string[]) => {
  const queryString = ids.join(",");
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
      queryString +
      "&vs_currencies=usd"
  );
  return response.json();
};
