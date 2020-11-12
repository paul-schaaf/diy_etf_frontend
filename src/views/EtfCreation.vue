<template>
  <div>
    <label for="feePayer">Fee payer </label>
    <input v-model="feePayerSecret" type="text" name="feePayer" />
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
      onkeyup="if(this.value<0){this.value= this.value * -1}"
      v-model.number="token.percentage"
    />
  </div>
  <div>
    <input :disabled="!percentageSum100" type="submit" @click="onCreateEtf" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import { EtfComponent } from "@/utils/etf";
import { createEtf } from "@/utils/createEtf";

export default defineComponent({
  name: "EtfCreation",
  setup() {
    const shareValueInUsd = ref(0);
    const feePayerSecret = ref("");

    const tokens = reactive<EtfComponent[]>([
      { name: "SRM", percentage: 50 },
      { name: "SOL", percentage: 50 }
    ]);

    const percentageSum100 = computed(
      () => tokens.reduce((acc, c) => acc + c.percentage, 0) === 100
    );

    const onCreateEtf = async () => {
      await createEtf(tokens, shareValueInUsd.value, feePayerSecret.value);
    };

    return {
      shareValueInUsd,
      onCreateEtf,
      tokens,
      percentageSum100,
      feePayerSecret
    };
  }
});
</script>
