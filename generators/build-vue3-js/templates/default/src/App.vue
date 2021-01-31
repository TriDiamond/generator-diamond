<template>
  <div id="app">
    <div id="nav" v-if="$route.path !== '/404'">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #cccccc;
  background-color: #100e17;
  min-height: 100vh;
  min-width: 100vw;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #cccccc;

    &.router-link-exact-active {
      color: #0fb6d6;
    }
  }
}
</style>
