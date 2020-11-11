<template>
  <div>
    <label for="feePayer">Fee payer </label>
    <input type="text" name="feePayer" />
  </div>
  <div>
    <label for="shareValue">ETF share value (nondivisible) in usd </label>
    <input v-model="shareValueInUsd" type="number" name="shareValue" />
  </div>
  <div v-for="(token, index) in tokens" :key="index">
    <label :for="'token' + (index + 1)">Token {{ index + 1 }} </label>
    <input type="text" :name="'token' + (index + 1)" v-model="token.name" />
    <label :for="'token' + (index + 1) + 'percentage'"> Percentage </label>
    <input
      type="number"
      :name="'token' + (index + 1) + 'percentage'"
      v-model="token.percentage"
    />
  </div>
  <div>
    <input type="submit" @click="createETF" />
  </div>
  <div v-for="amount in formattedVaultAccounts">{{ amount }}</div>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import { getTokenPricesInUSD } from "@/utils/tokenPriceApi";
import {
  convertPriceToSmallestUnit,
  EtfComponent,
  createVaultAmounts
} from "@/utils/tokens";
import BN from "bn.js";

export default defineComponent({
  name: "EtfCreation",
  setup() {
    const shareValueInUsd = ref(0);

    const tokens = reactive<EtfComponent[]>([
      { name: "SRM", percentage: 50 },
      { name: "SOL", percentage: 50 }
    ]);

    const serumPrice = ref<null | number[]>(null);

    const vaultAmounts = reactive<{ amounts: BN[] }>({ amounts: [] });

    const createETF = async () => {
      vaultAmounts.amounts = await createVaultAmounts(
        tokens,
        shareValueInUsd.value
      );
    };

    const mapBNtoArray = (bn: BN) => bn.toArray("le", 8);

    const formattedVaultAccounts = computed(() => vaultAmounts.amounts.map(mapBNtoArray));

    return { shareValueInUsd, serumPrice, createETF, tokens, vaultAmounts, formattedVaultAccounts };
  }
});
</script>
