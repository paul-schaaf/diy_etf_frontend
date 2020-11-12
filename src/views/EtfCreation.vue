<template>
  <div id="etf-creation-container">
    <div id="etf-creation-heading">
      <span id="d">d</span>
      <span id="i">i</span>
      <span id="y">y </span>
      <span id="e">e</span>
      <span id="t">t</span>
      <span id="f">f</span>
    </div>
    <div id="etf-creation-form">
      <div>
        <label for="feePayer">Fee payer </label>
        <input v-model="feePayerSecret" type="text" name="feePayer" placeholder="your seed phrase..." />
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
      <div v-for="(token, index) in tokens" :key="index">
        <label :for="'token' + (index + 1)">Token {{ index + 1 }} </label>
        <input type="text" :name="'token' + (index + 1)" v-model="token.name" />
        <label :for="'token' + (index + 1) + 'percentage'"> Percentage </label>
        <input
          v-model.number="token.percentage"
          :name="'token' + (index + 1) + 'percentage'"
          onkeyup="if(this.value<0){this.value= this.value * -1}"
          type="number"
          min="1"
        />
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

    const isCreatingEtf = ref(false);
    const onCreateEtf = async () => {
      isCreatingEtf.value = true;
      try {
        await createEtf(tokens, shareValueInUsd.value, feePayerSecret.value);
      } catch (err) {
        alert(err);
      }
      isCreatingEtf.value = false;
    };

    return {
      shareValueInUsd,
      onCreateEtf,
      tokens,
      percentageSum100,
      feePayerSecret,
      isCreatingEtf
    };
  }
});
</script>

<style lang="scss" scoped>
#etf-creation-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  #etf-creation-heading {
    font-size: 60px;
    transform: rotate(-10deg);
    margin-top: 60px;

    span {
      font-family: "Roboto Slab", serif;
    }

    #d {
      color: #de0000;
    }

    #i {
      color: #de6b00;
    }

    #y {
      color: #e5cf5b;
    }

    #e {
      color: #87e55b;
    }

    #t {
      color: #5be5dd;
    }

    #f {
      color: #5b82e5;
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
    }

    input {
      width: 100%;
      height: 40px;
      font-size: 18px;
      border-radius: var(--border-radius);
      border: 1px solid var(--main-grey);
      background: var(--light-grey);
      margin: 5px 0 20px 10px;
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
        padding: 1.5px;
      }

      [type="submit"] {
        cursor: pointer;
        margin: 0;
        background: var(--bg-grey);
        padding: 0 0 3px 0;
        width: 130px;
        border: none;

        &:disabled {
          cursor: not-allowed;;
        }
      }
    }
  }
}
</style>