<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { changeCluster } from "@/utils/connection";

export default defineComponent({
  name: "App",
  setup() {
    changeCluster("localnet");
  }
});
</script>

<style lang="scss">
:root {
  --main-grey: #464646;
  --bg-grey: #f3f3f3;
  --border-radius: 10px;
}

html,
body {
  background: var(--bg-grey);
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: "Sansita", sans-serif;
  color: var(--main-grey);
}
</style>
