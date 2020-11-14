<template>
  <div id="redeem-shares-container">
    <div v-if="redeemedETFAddress" id="redeem-shares-success-msg">
      Successfully redeemed {{ redeemedShares }} share{{
        redeemedShares > 1 ? "s" : ""
      }}
      of ETF: {{ redeemedETFAddress }}
      <p><span>Check your wallet for the received tokens!</span></p>
    </div>
    <div id="redeem-shares-form">
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
        <label for="userPoolTokenAccountAddress"
          >The token account address of your pool tokens</label
        >
        <input
          v-model="userPoolTokenAccountAddress"
          type="text"
          name="userPoolTokenAccountAddress"
          placeholder="token account address..."
        />
      </div>
      <div>
        <label for="shares">Amount of ETF shares to redeem</label>
        <input
          v-model="shares"
          type="number"
          name="shares"
          onkeyup="if(this.value<0){this.value= this.value * -1}"
          min="1"
        />
      </div>
      <div id="redeem-shares-form-submit-container">
        <div id="gradient-wrapper">
          <div>
            <input
              :disabled="isRedeemingShares"
              :value="isRedeemingShares ? 'loading...' : 'redeem shares'"
              type="submit"
              @click="onRedeemShares"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { redeemShares } from "@/utils/etf/redeemShares";

export default defineComponent({
  name: "RedeemShares",
  setup() {
    const feePayerSecret = ref("");
    const etfAddress = ref("");
    const shares = ref(1);
    const userPoolTokenAccountAddress = ref("");
    const isRedeemingShares = ref(false);

    const redeemedShares = ref(0);
    const redeemedETFAddress = ref("");
    const onRedeemShares = async () => {
      redeemedShares.value = 0;
      redeemedETFAddress.value = "";
      isRedeemingShares.value = true;
      const etfAddressStatic = etfAddress.value;
      const etfSharesStatic = shares.value;
      try {
        await redeemShares(
          feePayerSecret.value,
          etfAddress.value,
          shares.value,
          userPoolTokenAccountAddress.value
        );
        redeemedShares.value = etfSharesStatic;
        redeemedETFAddress.value = etfAddressStatic;
      } catch (err) {
        console.log(err);
        alert(err);
      }

      window.scrollTo(0, 0);
      isRedeemingShares.value = false;
    };

    return {
      feePayerSecret,
      etfAddress,
      shares,
      isRedeemingShares,
      onRedeemShares,
      redeemedShares,
      redeemedETFAddress,
      userPoolTokenAccountAddress
    };
  }
});
</script>

<style lang="scss" scoped>
#redeem-shares-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  #redeem-shares-success-msg {
    text-align: center;
    width: 450px;
    padding: 0px 10px 0px 10px;
    margin-top: 50px;

    span {
      color: var(--blue);
    }
  }

  #redeem-shares-form {
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
