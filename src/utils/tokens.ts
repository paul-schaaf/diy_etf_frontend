import BN from "bn.js";

import TOKEN_LIST from "./token-list.json";
import { chosenCluster } from "@/utils/connection";
import { getTokenPricesInUSD } from "./tokenPriceApi";

export interface EtfComponent {
  name: string;
  percentage: number;
}

export const convertPriceToSmallestUnit = (price: number, decimals: number) => {
  const numberWithDecimals = price.toFixed(decimals);

  const numberAsStringInSmallestUnit = numberWithDecimals.replace(".", "");

  return new BN(numberAsStringInSmallestUnit, 10);
};

// TODO can be made more efficient
export const createVaultAmounts = async (
  components: EtfComponent[],
  shareValueInUsd: number
) => {
  const clusterTokens = TOKEN_LIST.localnet;
  const coingeckoIds = components.map(component => {
    return clusterTokens.filter(
      token => token.tokenSymbol === component.name
    )[0].coingeckoId;
  });

  const prices = await getTokenPricesInUSD(coingeckoIds);
  const vaultPartsInUsd = components.map(
    c => shareValueInUsd * (c.percentage / 100)
  );
  return components.map((c, index) => {
    const tokenPrice = prices[coingeckoIds[index]].usd;
    const tokenAmounts = (vaultPartsInUsd[index] / tokenPrice).toFixed(
      clusterTokens.filter(token => token.tokenSymbol === c.name)[0].decimals
    );
    return new BN(tokenAmounts.replace(".", ""), 10);
  });
};
