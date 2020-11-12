<template>
  <div id="buy-shares-container">
    <div id="buy-shares-form">
      <div>
        <label for="feePayer">Fee and share payer</label>
        <input
          v-model="feePayerSecret"
          type="text"
          name="feePayer"
          placeholder="your seed phrase..."
        />
      </div>
      <div>
        <label for="etfAddress">ETF address</label>
        <input
          v-model="etfAddress"
          type="text"
          name="etfAddress"
          placeholder="the ETF address..."
        />
      </div>
      <div>
        <label for="shares">ETF shares</label>
        <input
          v-model="shares"
          type="number"
          name="shares"
          onkeyup="if(this.value<0){this.value= this.value * -1}"
          min="1"
        />
      </div>
      <div id="buy-shares-form-submit-container">
        <div id="gradient-wrapper">
          <div>
            <input
              :disabled="isBuyingShares"
              :value="isBuyingShares ? 'loading...' : 'buy shares'"
              type="submit"
              @click="onBuyShares"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "BuyShares",
  setup() {
    const feePayerSecret = ref("");
    const etfAddress = ref("");
    const shares = ref(1);
    const isBuyingShares = ref(false);

    const onBuyShares = () => {};

    return { feePayerSecret, etfAddress, shares, isBuyingShares, onBuyShares };
  }
});
</script>

<style lang="scss" scoped>
#buy-shares-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  #buy-shares-form {
    display: flex;
    flex-direction: column;
    width: 450px;
    margin-top: 40px;

    label {
      padding-left: 3px;
      font-size: 16px;
      display: block;
    }

    input {
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
