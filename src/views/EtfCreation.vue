<template>
  <div id="etf-creation-container">
    <div v-if="etfAddress" id="etf-creation-success-msg">
      ETF successfully created! Here's the address of the ETF you've created:
      <span>{{ etfAddress }}</span>
      Save it because you'll need it to create and redeem ETF shares.
    </div>
    <div id="etf-creation-form">
      <div>
        <label for="feePayer">Fee payer </label>
        <input
          v-model="feePayerSecret"
          type="text"
          name="feePayer"
          placeholder="your seed phrase..."
        />
      </div>
      <div>
        <label for="shareValue">ETF share value (nondivisible) in usd </label>
        <input
          v-model="shareValueInUsd"
          type="number"
          name="shareValue"
          onkeyup="if(this.value<0){this.value= this.value * -1}"
          min="1"
        />
      </div>
      <div
        v-for="(token, index) in selectedTokens"
        :key="index"
        class="token-form-field"
      >
        <div class="token-address-form-field">
          <label :for="'token' + (index + 1)">Token {{ index + 1 }} </label>
          <select v-model="token.name" :name="'token' + (index + 1)">
            <option
              v-for="(token, index) in getSelectableTokens(token.name)"
              :key="index"
              :value="token.name"
              >{{ token.name }}</option
            >
          </select>
        </div>
        <div class="token-percentage-form-field">
          <label :for="'token' + (index + 1) + 'percentage'">%</label>
          <input
            v-model.number="token.percentage"
            :name="'token' + (index + 1) + 'percentage'"
            onkeyup="if(this.value<0){this.value= this.value * -1}"
            type="number"
            min="1"
          />
        </div>
      </div>
      <div id="etf-creation-form-submit-container">
        <div id="gradient-wrapper">
          <div>
            <input
              :disabled="!percentageSum100 || isCreatingEtf"
              :value="isCreatingEtf ? 'loading...' : 'create etf'"
              type="submit"
              @click="onCreateEtf"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import { EtfComponent } from "@/utils/etf/etf";
import { createEtf } from "@/utils/etf/createEtf";
import TOKENS from "@/utils/token-list.json";
import { chosenCluster } from "@/utils/connection";

export default defineComponent({
  name: "EtfCreation",
  setup() {
    const shareValueInUsd = ref(0);
    const feePayerSecret = ref("");
    const etfAddress = ref("");

    const clusterTokens = TOKENS[chosenCluster.value];
    const selectedTokens = reactive<EtfComponent[]>(
      clusterTokens
        .slice(0, 2)
        .map(token => ({ name: token.tokenSymbol, percentage: 50 }))
    );

    const getSelectableTokens = (selectedTokenName: string) => {
      return clusterTokens
        .filter(
          token =>
            !selectedTokens.find(
              t => selectedTokenName !== t.name && t.name === token.tokenSymbol
            )
        )
        .map(token => ({ name: token.tokenSymbol, percentage: 50 }));
    };

    const percentageSum100 = computed(
      () => selectedTokens.reduce((acc, c) => acc + c.percentage, 0) === 100
    );

    const isCreatingEtf = ref(false);
    const onCreateEtf = async () => {
      if (!shareValueInUsd.value) {
        alert("Share value must not be 0");
        return;
      }
      etfAddress.value = "";
      isCreatingEtf.value = true;
      try {
        etfAddress.value = await createEtf(
          selectedTokens,
          shareValueInUsd.value,
          feePayerSecret.value
        );
      } catch (err) {
        alert(err);
      }
      window.scrollTo(0, 0);
      isCreatingEtf.value = false;
    };

    return {
      shareValueInUsd,
      onCreateEtf,
      selectedTokens,
      getSelectableTokens,
      percentageSum100,
      feePayerSecret,
      isCreatingEtf,
      etfAddress
    };
  }
});
</script>

<style lang="scss" scoped>
#etf-creation-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  #etf-creation-success-msg {
    text-align: center;
    width: 450px;
    padding: 0px 10px 0px 10px;
    margin-top: 50px;

    span {
      color: var(--blue);
    }
  }

  #etf-creation-form {
    display: flex;
    flex-direction: column;
    width: 450px;
    margin-top: 40px;

    label {
      padding-left: 3px;
      font-size: 16px;
      display: block;
    }

    .token-form-field {
      display: flex;
      justify-content: space-between;
      margin: 0;
      .token-address-form-field {
        width: 84%;
        margin: 0;
        position: relative;

        &::after {
          content: "<";
          position: absolute;
          pointer-events: none;
          -webkit-transform: rotate(-90deg);
          -moz-transform: rotate(-90deg);
          -ms-transform: rotate(-90deg);
          transform: rotate(-90deg);
          right: 20px;
          top: 35px;
        }
      }

      .token-percentage-form-field {
        width: 15%;
        margin: 0%;
      }
    }

    select {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      &::-ms-expand {
        display: none;
      }
    }

    input,
    select {
      width: 100%;
      height: 40px;
      font-size: 18px;
      border-radius: var(--border-radius);
      border: 1px solid var(--main-grey);
      background: var(--light-grey);
      margin: 5px 0px 20px 0px;
      padding: 0 10px 2px 10px;
    }

    &-submit-container {
      display: flex;
      justify-content: center;

      #gradient-wrapper {
        height: 40px;
        width: 130px;
        background: linear-gradient(
          90deg,
          rgba(91, 130, 229, 1) 0%,
          rgba(91, 229, 221, 1) 20%,
          rgba(135, 229, 91, 1) 40%,
          rgba(229, 207, 91, 1) 60%,
          rgba(222, 107, 0, 1) 80%,
          rgba(255, 0, 0, 1) 100%
        );
        border-radius: var(--border-radius);
        margin-top: 5px;
        margin-bottom: 25px;
        box-sizing: content-box;
        padding: 2px;
      }

      [type="submit"] {
        cursor: pointer;
        margin: 0;
        background: var(--bg-grey);
        padding: 0 0 3px 0;
        width: 130px;
        border: none;

        &:disabled {
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
