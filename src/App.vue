<template>
  <div id="navbar">
    <span><router-link to="/">Create</router-link></span>
    |
    <span><router-link to="/buy-shares">Buy Shares</router-link></span>
    |
    <span>Redeem Shares</span>
    |
    <span>Inspect</span>
  </div>
  <div id="etf-heading">
    <span id="d">d</span>
    <span id="i">i</span>
    <span id="y">y </span>
    <span id="e">e</span>
    <span id="t">t</span>
    <span id="f">f</span>
  </div>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { changeCluster } from "@/utils/connection";
import { ROUTES } from "./router";

export default defineComponent({
  name: "App",
  setup() {
    changeCluster("localnet");

    return { ROUTES };
  }
});
</script>

<style lang="scss">
:root {
  --main-grey: #464646;
  --bg-grey: #f3f3f3;
  --border-radius: 10px;
  --red: #de0000;
  --orange: #de6b00;
  --yellow: #e5cf5b;
  --green: #87e55b;
  --cyan: #5be5dd;
  --blue: #5b82e5;
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

#navbar {
  display: flex;
  justify-content: center;
  margin-top: 10px;

  span {
    margin: 0 3px 0 3px;
    cursor: pointer;

    &:nth-child(1) a.router-link-active {
      border-bottom: 2px solid var(--red);
    }

    &:nth-child(2) a.router-link-active {
      border-bottom: 2px solid var(--yellow);
    }

    &:nth-child(3) a.router-link-active {
      border-bottom: 2px solid var(--green);
    }

    &:nth-child(4) a.router-link-active {
      border-bottom: 2px solid var(--blue);
    }

    a {
      text-decoration: none;
      box-sizing: content-box;
      padding-bottom: 2px;
    }
  }
}

#etf-heading {
  display: flex;
  justify-content: center;
  font-size: 60px;
  transform: rotate(-10deg);
  margin-top: 50px;

  span {
    font-family: "Roboto Slab", serif;
  }

  #d {
    color: var(--red);
  }

  #i {
    color: var(--orange);
  }

  #y {
    color: var(--yellow);
  }

  #e {
    color: var(--green);
    margin-left: 15px;
  }

  #t {
    color: var(--cyan);
  }

  #f {
    color: var(--blue);
  }
}
</style>
