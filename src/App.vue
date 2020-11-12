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
